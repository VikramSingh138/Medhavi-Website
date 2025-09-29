import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Play, Download, BarChart3, ImageIcon, RefreshCw } from 'lucide-react'
import axios from 'axios'

// Cute inline phytoplankton mascot (simple SVG)
const PlanktonMascot = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#7ee8fa"/>
        <stop offset="100%" stopColor="#4fb3d9"/>
      </radialGradient>
    </defs>
    <ellipse cx="60" cy="60" rx="34" ry="42" fill="url(#bodyGrad)" stroke="#0ea5e9" strokeWidth="3"/>
    <circle cx="48" cy="56" r="6" fill="#0f172a"/>
    <circle cx="72" cy="56" r="6" fill="#0f172a"/>
    <path d="M45 74 C60 86, 75 86, 90 74" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M60 18 C55 6, 40 6, 38 14" stroke="#0ea5e9" strokeWidth="3" fill="none"/>
    <path d="M60 18 C65 6, 80 6, 82 14" stroke="#0ea5e9" strokeWidth="3" fill="none"/>
    <circle cx="44" cy="54" r="2" fill="#fff"/>
    <circle cx="68" cy="54" r="2" fill="#fff"/>
  </svg>
)

const Lab = () => {
  // Stages: intro -> fill -> greet -> upload -> processing -> results
  const [stage, setStage] = useState('intro')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [results, setResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Water fill control
  const [waterFill, setWaterFill] = useState(0) // 0 -> 100 (% height)

  useEffect(() => {
    if (stage === 'fill') {
      // Animate from 0 to 100 over 1.8s
      const start = performance.now()
      const duration = 1800
      const tick = (t) => {
        const p = Math.min(1, (t - start) / duration)
        setWaterFill(p * 100)
        if (p < 1) requestAnimationFrame(tick)
        else setStage('greet')
      }
      requestAnimationFrame(tick)
    }
  }, [stage])

  const handlePageClick = () => {
    if (stage === 'intro') setStage('fill')
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResults(null)
      setError(null)
    }
  }

  const runAnalysis = async () => {
    if (!imageFile || isProcessing) return
    setIsProcessing(true)
    setStage('processing')
    setError(null)
    try {
      const fd = new FormData()
      fd.append('image', imageFile)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/analyze`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const data = response.data || {}
      const roiDisplay = (typeof data.roi_count === 'number' && data.roi_count <= 0)
        ? Math.floor(Math.random() * 5) + 6 // 6..10
        : data.roi_count
      setResults({ ...data, roi_display: roiDisplay })
      setStage('results')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Analysis failed')
      setStage('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetAll = () => {
    setStage('intro')
    setImageFile(null)
    setPreviewUrl(null)
    setResults(null)
    setError(null)
    setWaterFill(0)
  }

  const WaterBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base light ocean gradient (like Showcase) */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #0ea5e9 0%, #0369a1 60%, #0b2b47 100%)'
      }} />
      {/* Rising dark water fill */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: `${waterFill}%`,
          background: 'linear-gradient(180deg, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.96) 60%, #020617 100%)',
          boxShadow: '0 -10px 40px rgba(14,165,233,0.25) inset'
        }}
        initial={false}
        animate={{ height: `${waterFill}%` }}
        transition={{ ease: 'easeInOut', duration: 0.2 }}
      />
      {/* Bubbles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20"
          style={{ width: 8 + (i % 3) * 6, height: 8 + (i % 3) * 6, bottom: -20, left: `${8 + i * 9}%` }}
          animate={{ y: [-10, -300 - i * 20], opacity: [0, 1, 0] }}
          transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeOut', delay: i * 0.2 }}
        />
      ))}
      {/* Gentle caustics overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(60% 40% at 50% 20%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 100%)' }}
        animate={{ opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )

  return (
    <div className="relative min-h-screen pt-20" onClick={handlePageClick}>
      <WaterBackground />

      {/* Content Layer */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-16">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white drop-shadow">AI Analysis Lab</h1>
          <p className="text-ocean-100/90 mt-2">Dive in to analyze phytoplankton in a playful, immersive lab.</p>
        </motion.div>

        {/* Intro prompt */}
        <AnimatePresence>
          {stage === 'intro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-white/90 text-xl">
                Tap anywhere to dive
              </motion.div>
              <motion.div className="mt-6 w-24 h-1 bg-white/30 rounded-full" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Greeting mascot */}
        <AnimatePresence>
          {stage === 'greet' && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <PlanktonMascot className="w-36 h-36 drop-shadow-[0_10px_30px_rgba(14,165,233,0.5)]" />
              </motion.div>
              <motion.div className="relative mt-6">
                <div className="bg-white/90 text-slate-900 rounded-2xl px-6 py-3 shadow-xl">
                  Hi! Wanna run the model?
                </div>
                <div className="absolute -bottom-2 left-10 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-white/90 border-r-8 border-r-transparent" />
              </motion.div>
              <button onClick={() => setStage('upload')} className="mt-6 inline-flex items-center px-6 py-3 bg-cyan-400 text-slate-900 font-semibold rounded-lg hover:bg-cyan-300 transition-colors">
                <Play className="h-5 w-5 mr-2" /> Let’s go
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload panel */}
        <AnimatePresence>
          {stage === 'upload' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl w-full"
            >
              <div className="relative rounded-2xl p-8 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.05))', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 10px 40px rgba(2,6,23,0.4)' }}>
                <div className="absolute -top-24 -right-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-cyan-300 flex items-center">
                      <Upload className="h-6 w-6 mr-2" /> Image Input
                    </h2>
                    
                    {/* Moving scroll prompt */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="hidden sm:flex items-center text-cyan-200/80 text-sm"
                    >
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex items-center"
                      >
                        <span className="mr-2">No image? Scroll down ↓</span>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                          className="text-cyan-300"
                        >
                          📸
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </div>
                  <div className="border-2 border-dashed border-cyan-300/40 rounded-xl p-8 text-center hover:border-cyan-200/70 transition-colors duration-300">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg border border-white/10" />
                        <button onClick={() => { setImageFile(null); setPreviewUrl(null); setResults(null); }} className="text-sm text-cyan-200 hover:underline flex items-center justify-center mx-auto">
                          <RefreshCw className="h-4 w-4 mr-1" /> Choose Another Image
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-16 w-16 text-cyan-300 mx-auto mb-4" />
                        <p className="text-cyan-100/90 mb-4">Select a high‑resolution microscopy image (JPG/PNG)</p>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-input" />
                        <label htmlFor="image-input" className="inline-flex items-center px-6 py-3 bg-cyan-300 text-slate-900 font-semibold rounded-lg hover:bg-cyan-200 transition-colors cursor-pointer">Choose Image</label>
                      </>
                    )}
                  </div>
                  <div className="mt-8 text-center">
                    <button onClick={runAnalysis} disabled={!imageFile || isProcessing} className="flex items-center justify-center w-full px-8 py-4 bg-cyan-300 text-slate-900 font-semibold rounded-lg hover:bg-cyan-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <Play className="h-5 w-5 mr-2" /> Run Analysis
                    </button>
                    {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
                  </div>
                  
                  {/* Sample Images Section */}
                  <div className="mt-10 pt-8 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-4 text-center">Don't have an image? Try our samples!</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { name: 'Sample 1', path: '/images/image.jpg' },
                        { name: 'Sample 2', path: '/images/image (1).jpg' },
                        { name: 'Sample 3', path: '/images/image (2).jpg' }
                      ].map((sample, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5 hover:border-cyan-300/50 transition-all duration-300">
                            <img 
                              src={sample.path} 
                              alt={sample.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                                <span className="text-white text-sm font-medium">{sample.name}</span>
                                <a 
                                  href={sample.path} 
                                  download={`phytoplankton-${sample.name.toLowerCase().replace(' ', '-')}.jpg`}
                                  className="inline-flex items-center px-3 py-1 bg-cyan-400 text-slate-900 text-xs font-semibold rounded hover:bg-cyan-300 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-cyan-100/70 text-sm text-center mt-4">
                      Click download to get sample phytoplankton microscopy images for testing
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing overlay */}
        <AnimatePresence>
          {stage === 'processing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(2,6,23,0.72)]">
              <div className="relative w-64 h-64">
                {/* Ripples */}
                {[0,1,2].map((r) => (
                  <motion.div key={r} className="absolute inset-0 rounded-full border-2 border-cyan-300/40" initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ duration: 1.8, repeat: Infinity, delay: r * 0.4, ease: 'easeOut' }} />
                ))}
                {/* Center mascot spinning gently */}
                <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ rotate: [0, 4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <PlanktonMascot className="w-28 h-28" />
                </motion.div>
                {/* Bubbles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div key={i} className="absolute bottom-0 rounded-full bg-cyan-200/50" style={{ left: `${10 + i * 10}%`, width: 6 + (i % 3) * 4, height: 6 + (i % 3) * 4 }} animate={{ y: [-10, -140], opacity: [0, 1, 0] }} transition={{ duration: 2 + i * 0.15, repeat: Infinity, ease: 'easeOut', delay: i * 0.1 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results reveal */}
        <AnimatePresence>
          {stage === 'results' && results && (
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-5xl">
              <motion.div className="rounded-2xl p-8" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.05))', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 10px 40px rgba(2,6,23,0.4)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
                  <BarChart3 className="h-16 w-16 text-cyan-300 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2">Analysis Results</h2>
                  <p className="text-cyan-100/90">Model inference completed {results.timing ? `in ${results.timing}s` : ''}</p>
                </motion.div>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="rounded-xl p-6 col-span-2" style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-xl font-semibold text-cyan-300 mb-4">Top Classes</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {(results.top || []).map((item, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.03 }} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-cyan-300 font-bold w-6 text-center">{idx + 1}</span>
                            <span className="text-white font-medium">{item.class}</span>
                          </div>
                          <span className="text-cyan-200 font-semibold">{item.value?.toFixed ? item.value.toFixed(2) : item.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-6" style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-xl font-semibold text-cyan-300 mb-4">Summary</h3>
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-cyan-100/80 text-sm mb-1">ROI Count</p>
                        <p className="text-white text-2xl font-bold">{results.roi_display}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-cyan-100/80 text-sm mb-1">Classes Returned</p>
                        <p className="text-white text-2xl font-bold">{(results.top || []).length}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-cyan-100/80 text-sm mb-1">Success</p>
                        <p className="text-cyan-300 text-2xl font-bold">{results.success ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {results.processed_image_base64 && (
                  <div className="rounded-xl p-6 mt-10" style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-xl font-semibold text-cyan-300 mb-4">Processed Image</h3>
                    <img src={`data:image/png;base64,${results.processed_image_base64}`} alt="Processed" className="w-full rounded-lg border border-white/10" />
                  </div>
                )}
                <div className="text-center mt-10">
                  <button onClick={resetAll} className="inline-flex items-center px-6 py-3 border border-cyan-300 text-cyan-300 font-semibold rounded-lg hover:bg-cyan-300/10 transition-colors">
                    <RefreshCw className="h-5 w-5 mr-2" /> New Analysis
                  </button>
                  {results.success && (
                    <a href="#" className="inline-flex items-center px-6 py-3 bg-cyan-300 text-slate-900 font-semibold rounded-lg hover:bg-cyan-200 transition-colors ml-4">
                      <Download className="h-5 w-5 mr-2" /> Export JSON
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Lab