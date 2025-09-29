import fs from 'fs'
import path from 'path'
import Jimp from 'jimp'
import * as ort from 'onnxruntime-node'

/**
 * Lightweight ONNX inference wrapper to avoid Python dependency in deployment.
 * Assumes an ONNX model exporting raw counts per class (regression) or logits.
 * You must place the ONNX model at backend/models/phytoplankton_full_pipeline.onnx
 * and optionally a class list file at backend/models/classes.txt (one per line).
 */
export class PhytoplanktonOnnxRunner {
  constructor({ modelPath, classesPath }) {
    this.modelPath = modelPath
    this.classes = []
    if (classesPath && fs.existsSync(classesPath)) {
      this.classes = fs.readFileSync(classesPath, 'utf8').split(/\r?\n/).filter(Boolean)
    }
  }

  async init() {
    if (!fs.existsSync(this.modelPath)) {
      throw new Error('ONNX model not found at ' + this.modelPath)
    }
    this.session = await ort.InferenceSession.create(this.modelPath, { executionProviders: ['cpu'] })
  }

  async preprocess(imagePath) {
    const img = await Jimp.read(imagePath)
    img.cover(224, 224) // resize & crop center
    // normalize like ImageNet
    const mean = [0.485, 0.456, 0.406]
    const std = [0.229, 0.224, 0.225]
    const data = new Float32Array(3 * 224 * 224)
    let ptr = 0
    for (let y = 0; y < 224; y++) {
      for (let x = 0; x < 224; x++) {
        const { r, g, b } = Jimp.intToRGBA(img.getPixelColor(x, y))
        data[ptr] = (r / 255 - mean[0]) / std[0]
        data[ptr + 224 * 224] = (g / 255 - mean[1]) / std[1]
        data[ptr + 2 * 224 * 224] = (b / 255 - mean[2]) / std[2]
        ptr++
      }
    }
    return new ort.Tensor('float32', data, [1, 3, 224, 224])
  }

  async predict(imagePath) {
    if (!this.session) await this.init()
    const inputTensor = await this.preprocess(imagePath)
    const firstInputName = this.session.inputNames[0]
    const output = await this.session.run({ [firstInputName]: inputTensor })
    const firstOutputName = this.session.outputNames[0]
    // Ensure we operate on a plain array (Float32Array -> Array)
    const raw = output[firstOutputName].data
    const values = Array.isArray(raw) ? raw : Array.from(raw)

    // If model outputs multidimensional (e.g., [1, N]) flatten
    const flat = values.flat ? values.flat() : values

    // Build class labels
    let classes
    if (this.classes.length === flat.length) {
      classes = this.classes
    } else {
      classes = Array.from({ length: flat.length }, (_, i) => 'class_' + i)
    }

    // Build counts map with sanitization
    const counts = {}
    classes.forEach((c, i) => {
      const v = flat[i]
      counts[c] = Number.isFinite(v) ? v : 0
    })

    // Create sorted top list
    const top = classes.map((c, i) => ({ class: c, value: counts[c] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Presence map (value > 0) without using Object.fromEntries on typed arrays
    const presence = {}
    top.forEach(t => { presence[t.class] = t.value > 0 ? 1 : 0 })

    return { success: true, counts, top, presence, roi_count: 0 }
  }
}

export async function tryOnnxInference(imagePath) {
  try {
    // Assume server started with cwd at backend/ OR project root (contains backend/)
    let base = process.cwd()
    // If current working dir already ends with 'backend', use as-is, else append 'backend'
    const lower = base.replace(/\\/g,'/').toLowerCase()
    if (!lower.endsWith('/backend')) {
      const candidate = path.join(base, 'backend')
      if (fs.existsSync(candidate)) base = candidate
    }
    const modelPath = path.join(base, 'models', 'phytoplankton_full_pipeline.onnx')
    const classesPath = path.join(base, 'models', 'classes.txt')
    const runner = new PhytoplanktonOnnxRunner({ modelPath, classesPath })
    const result = await runner.predict(imagePath)
    return { ...result, modelPath }
  } catch (e) {
    return { success: false, error: e.message, stack: e.stack }
  }
}
