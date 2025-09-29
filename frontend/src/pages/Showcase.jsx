import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Linkedin,
  ArrowRight, 
  Download, 
  Zap, 
  Target, 
  Clock,
  Users,
  Github,
  ExternalLink,
  Fish,
  Waves,
  TrendingUp,
  HardDrive,
  Video,
  Timer,
  ArrowUpRight
} from 'lucide-react'
import axios from 'axios'
import UserStats from '../components/UserStats'

function TeamMemberCard({ member }) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br from-ocean-400 to-ocean-600">
      {member.image && !imgError ? (
        <img
          src={member.image}
          alt={member.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <Users className="h-12 w-12 text-white" />
      )} 
    </div>
  );
}

const Showcase = () => {
  // Map model names to local images
  const localImages = {
    'ResNet-50': '/images/resnet-img.png',
    'YOLOv8': '/images/yolov8-img.png',
    'BERT': '/images/bert-img.jpeg',
    'Hardware Integration': '/images/hardware-img.png',
    'Preprocessing Pipeline': '/images/resnet-img.png',
    'Model Pipeline': '/images/yolov8-img.png',
    'Integrated Full Approach': '/images/bert-img.jpeg',
  };

  // Track image error for fallback
  const [imgError, setImgError] = useState({});
  const [models, setModels] = useState([])
  const [downloads, setDownloads] = useState([])
  const [currentSoftware, setCurrentSoftware] = useState(0);
  const [currentHardware, setCurrentHardware] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalCard, setModalCard] = useState(null);
  const [bomData, setBomData] = useState([]);
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  // zoom defaults: three '-' presses -> 1 - 3*0.2 = 0.4
  const MIN_ZOOM = 0.25
  const MAX_ZOOM = 4
  const DEFAULT_ZOOM = 0.5
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const lightboxRef = useRef(null)

  // Helper: split a long description into up to 3 readable paragraphs
  const getParagraphs = (text, maxParagraphs = 3) => {
    if (!text || typeof text !== 'string') return [];
    // If author provided explicit blank-line breaks, honor them
    const hasNewlines = /\n\s*\n|\r\n\r\n/.test(text) || /\n/.test(text);
    if (hasNewlines) {
      const parts = text
        .split(/\n\s*\n|\r\n\r\n|\n/g)
        .map(s => s.trim())
        .filter(Boolean);
      return parts.slice(0, maxParagraphs);
    }
    // Otherwise, split by sentences and group into up to 3 chunks
    const sentences = (text.match(/[^.!?]+[.!?]+\s*/g) || [text]).map(s => s.trim());
    const n = sentences.length;
    if (n <= 2) return [sentences.join(' ')];
    if (n <= 4) return [sentences.slice(0, Math.ceil(n / 2)).join(' '), sentences.slice(Math.ceil(n / 2)).join(' ')];
    // 3 chunks roughly equal
    const size = Math.ceil(n / 3);
    const p1 = sentences.slice(0, size).join(' ');
    const p2 = sentences.slice(size, size * 2).join(' ');
    const p3 = sentences.slice(size * 2).join(' ');
    return [p1, p2, p3].filter(Boolean).slice(0, maxParagraphs);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsRes, downloadsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/models`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/downloads`)
        ])
        const normalizeArray = (payload) => {
          if (Array.isArray(payload)) return payload
          if (!payload) return []
          if (Array.isArray(payload.models)) return payload.models
          if (Array.isArray(payload.data)) return payload.data
          if (Array.isArray(payload.results)) return payload.results
          const values = Object.values(payload).filter(Boolean)
          const arrays = values.filter(v => Array.isArray(v))
          if (arrays.length === 1) return arrays[0]
          if (arrays.length > 1) return arrays.flat()
          return []
        }
        setModels(normalizeArray(modelsRes.data))
        setDownloads(normalizeArray(downloadsRes.data))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // Separate cards for software and hardware
  const softwareCards = [
    {
      id: 'sw-1',
      name: 'Preprocessing Pipeline',
      description:
        "Images are standardized and denoised before we look for organisms. We resize to 1024×1024, perform Gaussian blur denoising, and apply CLAHE separately to object and background regions to enhance contrast without amplifying noise. This produces a stable, high-contrast canvas across diverse microscopes and illumination conditions. " +
        "We then convert to grayscale, threshold to isolate foreground, and run contour detection to find candidate organisms. In post‑ROI steps, we extract tight bounding boxes, reject tiny or spurious regions, and scale/normalize each crop. The output is a clean set of normalized ROIs that are ready for fast, reliable inference.",
      image: 'https://res.cloudinary.com/dzgx1hfe6/image/upload/v1757842934/resnet-img_t1mwbo.png',
      metrics: { input: '1024×1024', stages: 'Pre/ROI/Post', output: 'Normalized ROIs' },
    },
    {
      id: 'sw-2',
      name: 'Model Pipeline',
      description:
        "Two complementary backbones learn count-aware features from each ROI. A MobileNetV2 branch with dropout = 20% and linear head and a ResNet18 branch modified for regression each predict a vector of counts per class. This dual-view design balances efficiency and representational power, capturing both lightweight textures and deeper semantics. " +
        "A RidgeCV meta‑learner fuses the two predictions to produce robust per‑class counts, a binary presence signal, and the top‑count classes. This stacking approach consistently improves stability on noisy marine imagery and overlapping organisms.",
      image: 'https://res.cloudinary.com/dzgx1hfe6/image/upload/v1757842933/yolov8-img_ddsco0.png',
      metrics: { backbones: 'MobileNetV2 + ResNet18', meta: 'RidgeCV', task: 'Count Regression' },
    },
    {
      id: 'sw-3',
      name: 'Integrated Full Approach',
      description:
        "End‑to‑end processing chains the preprocessing and model pipelines: incoming images are cleaned, ROIs are extracted and normalized, then each ROI is inferred by both backbones and fused by the meta‑learner. The system returns per‑class counts, presence, and a concise top‑classes summary. " +
        "For interpretability, we also produce an ROI visualization alongside classwise predictions. The integrated design is built for embedded use: low power, high throughput, and consistent accuracy in real‑time microscopy workflows.",
      image: 'https://res.cloudinary.com/dzgx1hfe6/image/upload/v1757842933/bert-img_capjea.jpg',
      metrics: { runtime: '~2.2 ms/sample', fps: '≈27.3', outputs: 'Counts • Presence • Top‑10' },
    },
  ];

  const hardwareCards = [
    {
      id: 'hw-1',
      name: "Darkfield Illumination",
      description: "In our setup we are using darkfield illumination, which simply means we shine light from the side rather than from directly underneath. Under this kind of lighting, only the edges and scattered light from very small particles, such as phytoplankton, become visible, while the background stays dark. This makes the microbes “glow” against a black background, enhancing their visibility. Importantly, when two or more microbes overlap in depth, the scattered light intensities add up. As a result, areas with overlapping microbes appear brighter than areas with a single organism. Technically, this difference in brightness can be quantified using intensity histograms of the captured image. By analyzing the distribution of pixel intensities, we can separate single microbes from regions where multiple microbes are stacked on top of each other. In other words, darker-to-brighter transitions in the histogram directly reflect whether particles are isolated or overlapping. This allows us to detect not only the presence of microbes, but also infer when one is sitting above another — which is critical in understanding real sample densities.",
      image: "https://res.cloudinary.com/dzgx1hfe6/image/upload/v1758109969/Hardware_Diagram_lkd5i8.jpg",
      metrics: { module: "Raspberry Pi 4B", io: "CSI/USB", speed: "Real-Time" },
    },
    {
      id: 'hw-2',
      name: "Pollaroid Approach",
      description: "In this approach we use two polarizing filters to reveal features of phytoplankton that are invisible in normal light. The first polarizer is placed just before the light source, so all the light entering the sample is neatly aligned in one direction — this is called linearly polarized light. The second polarizer is placed above the sample, between the microscope objective and the camera, and rotated 90° relative to the first. In this configuration, without any sample in place, the image appears almost completely dark, since the two filters block each other out. However, many phytoplankton are birefringent — they change the polarization of light as it passes through them. This means that when these microbes are present, light leaks through the second polarizer and they appear as bright, colorful, and structured shapes against a dark background. For single phytoplankton, the birefringent pattern is clean and well-defined, depending on their orientation. But when microbes overlap, the light is scattered and depolarized, producing irregular bright blobs that don’t resemble the typical single-cell pattern. Technically, we can quantify this effect by analyzing how much the light deviates from pure linear polarization. For example, by rotating the analyzer (the second polarizer) at multiple angles and recording the intensity changes, we can measure these deviations and objectively detect overlaps. This gives us a robust way to distinguish between individual phytoplankton and regions where multiple organisms are stacked together..",
      image: "https://res.cloudinary.com/dzgx1hfe6/image/upload/v1758109969/Hardware_Diagram_lkd5i8.jpg",
      metrics: { module: "Raspberry Pi 4B", io: "CSI/USB", speed: "Real-Time" },
    },
    {
      id: 'hw-3',
      name: "IR Radiation Approach",
      description: "Here we dedicate one camera to capturing a normal RGB image (the true-color view of the microbes), while the second camera is equipped with an infrared (IR) filter. By analyzing how the microbes interact with infrared light, we can compute depth information, since IR scattering and absorption patterns change depending on the thickness or overlap of organisms. In other words, the RGB camera gives us clear visual detail, while the IR camera adds a depth-sensitive layer of information. When the two are combined, we get both a high-quality color image and an accurate depth profile, which together make it possible to identify and separate overlapping microbes more reliably.",
      image: "https://res.cloudinary.com/dzgx1hfe6/image/upload/v1758109969/Hardware_Diagram_lkd5i8.jpg",
      metrics: { module: "Raspberry Pi 4B", io: "CSI/USB", speed: "Real-Time" },
    },
    {
      id: 'hw-4',
      name: "Stereo Camera Approach",
      description: "In this method, we use a stereo camera module, which consists of two identical cameras placed side by side, along with a 10× microscope lens. Just like our two eyes give us depth perception, the two cameras capture slightly different views of the same sample. When combined, these views allow us to generate a depth map, which reveals not only the shape of the microbes but also their relative positions in three dimensions. This is especially important for overlapping phytoplankton, because we can now detect which one is on top and which is below, rather than seeing just a flat 2D image.",
      image: "https://res.cloudinary.com/dzgx1hfe6/image/upload/v1758109969/Hardware_Diagram_lkd5i8.jpg",
      metrics: { module: "Raspberry Pi 4B", io: "CSI/USB", speed: "Real-Time" },
    }
  ];

  // Build slides: TEXT ONLY (images removed from approach sections)
  const toSlides = (arr) => arr.map(card => ({
    ...card,
    id: `${card.id}-txt`,
    type: 'text'
  }))
  const softwareSlides = toSlides(softwareCards)
  const hardwareSlides = toSlides(hardwareCards)

  // Auto-scroll for each carousel separately
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSoftware((prev) => (prev + 1) % softwareSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [softwareSlides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHardware((prev) => (prev + 1) % hardwareSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [hardwareSlides.length]);

  const handleCardClick = (card) => {
    setModalCard(card);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalCard(null);
  };

  const openLightbox = (src) => {
    setLightboxSrc(src)
    setZoom(DEFAULT_ZOOM)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxSrc(null)
    setZoom(1)
  }

  // Zoom handlers
  const onWheelZoom = (e) => {
    e.preventDefault()
    const delta = -e.deltaY || e.wheelDelta
    const factor = delta > 0 ? 0.1 : -0.1
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + factor).toFixed(2))))
  }

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.2).toFixed(2)))
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.2).toFixed(2)))
  const resetZoom = () => setZoom(DEFAULT_ZOOM)

  const teamMembers = [
    { 
      name: 'Deep', role: 'Data Scientist',
      image: 'https://res.cloudinary.com/dzgx1hfe6/image/upload/v1757840536/deep-sih_jkbnxk.jpg',
      linkedin: 'https://www.linkedin.com/in/deep-das-4b5aa527b/',
      github: 'https://github.com/THE-DEEPDAS'
    },
    { 
      name: 'Bodhini', role: 'Computer Vision',
      image: 'https://res.cloudinary.com/dzgx1hfe6/image/upload/v1757840536/bodhini-sih_l9a57c.jpg',
      linkedin: 'https://www.linkedin.com/in/bodhini-jain-6959322a6/',
      github: 'https://github.com/pro-jain'
    },
    { 
      name: 'Swapna', role: 'ML Lead',
      image: 'https://res.cloudinary.com/dzgx1hfe6/image/upload/v1757842334/swapna-sih_y7scyf.jpg',
      linkedin: 'https://www.linkedin.com/in/swapna-kondapuram-630626292/',
      github: 'https://github.com/swap0506'
    },
    { 
      name: 'Harsh', role: 'Hardware Lead',
      image: 'https://res.cloudinary.com/dzgx1hfe6/image/upload/v1757841049/harsh-sih_neek4o.jpg',
      linkedin: 'https://www.linkedin.com/in/harsh-bhadani-377792333/',
      github: 'https://github.com/harsh-profile'
    },
    { 
      name: 'Vikram', role: 'Web Developer',
      image: 'https://res.cloudinary.com/dzgx1hfe6/image/upload/v1757840974/vikram-sih_wdf9jf.jpg',
      linkedin: 'https://www.linkedin.com/in/vikram-singh-mehrolia/',
      github: 'https://github.com/VikramSingh138/'
    },
    { 
      name: 'Harshini', role: 'ML Lead',
      image: 'https://res.cloudinary.com/dzgx1hfe6/image/upload/v1757954052/harshini-sih_zrlqjh.jpg',
      linkedin: 'https://www.linkedin.com/in/harshini-manchala-5b5634327/',
      github: 'https://github.com/harshini-profile'
    }
  ]

  const pipelineStages = [
    { name: 'Image Capture', description: 'Using our custom designed hardware apparatus, raw marine samples are captured in fine detail.' },
    { name: 'Preprocessing', description: 'Captured images are enhanced through noise reduction, contrast adjustment, and normalization.' },
    { name: 'Classification', description: 'Our deep learning model identifies and classifies organisms in real-time with 88% accuracy.' },
    { name: 'Enumeration', description: 'Our deep learning model counts the number of phytoplanktons of each of the classes present with 0.91 R2 score.' }
  ]

  const impactMetrics = [
    { label: 'F1 Score', value: '96.0%', icon: Target },
    { label: 'R2 Score', value: '0.91', icon: TrendingUp },
    { label: 'Model Size', value: '46 KB', icon: HardDrive },
    { label: 'Frames Per Second', value: '27.3', icon: Video },
    { label: 'Processing per sample', value: '2.197 ms', icon: Clock },
    { label: 'Improvement over state-of-the-art', value: '5x', icon: ArrowUpRight }
  ]

  // Fallback BOM (used if XLSX parsing fails)
  const fallbackBOM = [
    { sr: 1, component: 'Single-board Computer', specs: 'Raspberry Pi 4 Model B (4GB)', cost: '₹4,639', link: 'https://shorturl.at/UrdgZ' },
    { sr: 2, component: 'Camera Module', specs: 'Raspberry Pi High Quality Camera (C/CS mount)', cost: '₹5,301', link: 'https://shorturl.at/E12LL' },
    { sr: 3, component: 'Lens (per camera)', specs: '100X Industrial Microscope Lens, C/CS-Mount', cost: '₹1,319', link: 'https://shorturl.at/Y4ptQ' },
    { sr: 4, component: 'Mount / Box for whole apparatus', specs: 'Custom 3D Printed', cost: '₹2,500', link: 'https://shorturl.at/VaZu9' },
    { sr: 5, component: 'Illumination - Transmitted (Darkfield)', specs: 'Slim LED Transmitted Backlight Panel (Darkfield)', cost: '₹90', link: 'https://shorturl.at/rt74Z' },
    { sr: 6, component: 'Illumination - Incident (ring)', specs: 'LED Ring Light for microscope / C-mount (60/72 LED)', cost: '₹529', link: 'https://tinyurl.com/58d75pu8' },
    { sr: 7, component: 'Power Supply', specs: 'Official Raspberry Pi 5V 3A USB-C PSU', cost: '₹673', link: 'https://tinyurl.com/4mnspr3z' },
    { sr: 8, component: 'microSD Card', specs: 'microSD Card 32GB UHS-I (for OS and storage)', cost: '₹399', link: 'https://tinyurl.com/5a492nbn' },
    { sr: 9, component: 'Slide', specs: 'Glass slide to keep the sample', cost: '₹5', link: 'https://tinyurl.com/3z43jbkr' },
    { sr: 10, component: 'Cables & Accessories', specs: 'Camera ribbon cable (+ included) & HDMI/USB/Wi-Fi etc.', cost: '₹500 (approx)', link: 'https://s1nk.com/SvNaD' },
  ];

  return (
<div className="ocean-gradient h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {/* Hero Section */}
 <section
    className="snap-start flex items-center justify-center px-4"
    style={{ minHeight: 'calc(100vh - 60px)' }} // navbar height = 80px
  >
    <div className="max-w-7xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Discover Marine Life
          <span className="block text-ocean-200">with AI Precision</span>
        </h1>
        <p className="text-xl md:text-2xl text-ocean-100 mb-8 max-w-3xl mx-auto">
          Revolutionary embedded AI system for real-time identification and analysis 
          of marine organisms through intelligent microscopy
        </p>
        
        {/* CTA Button and User Stats Side by Side */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
          <Link
            to="/run"
            className="inline-flex items-center px-8 py-4 bg-white text-ocean-600 font-semibold rounded-full hover:bg-ocean-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Run Model <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          
          {/* User Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <UserStats />
          </motion.div>
        </div>
        </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative"
      >
        <div className="w-64 h-64 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-float">
          <Fish className="h-32 w-32 text-white" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow rounded-full"></div>
      </motion.div>
    </div>
  </section>

  {/* New: Hardware Workflow + Model Architecture Images */}
  <section
    className="snap-start flex items-center justify-center px-4 bg-white/5 backdrop-blur-sm"
    style={{ minHeight: 'calc(100vh - 60px)', paddingTop: 'calc(var(--navbar-height) + 2rem)' }}
  >
    <div className="max-w-7xl mx-auto w-full">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-white text-center mb-12"
      >
        Hardware Workflow & Model Architecture
      </motion.h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-effect rounded-xl overflow-hidden p-4 h-96"
        >
          <button className="w-full h-full p-0 m-0 block" onClick={() => openLightbox('/hardware_workflow.jpg')}>
            <img
              src="/hardware_workflow.jpg"
              alt="Hardware Workflow"
              className="w-full h-full object-contain"
            />
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-effect rounded-xl overflow-hidden p-4 h-96"
        >
          <button className="w-full h-full p-0 m-0 block" onClick={() => openLightbox('/model.png')}>
            <img
              src="/model.png"
              alt="Model Architecture"
              className="w-full h-full object-contain"
            />
          </button>
        </motion.div>
      </div>
    </div>
  </section>

  {/* Lightbox Modal for images */}
  {lightboxOpen && (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70" onClick={closeLightbox}>
      <div className="relative" style={{ width: '80vw', height: '80vh' }} onClick={(e) => e.stopPropagation()} ref={lightboxRef} onWheel={onWheelZoom}>
        <button onClick={closeLightbox} className="absolute top-3 right-3 z-30 bg-white/90 text-slate-900 rounded-full p-2">✕</button>
        <div className="absolute top-3 left-3 z-30 flex space-x-2">
          <button onClick={zoomOut} className="bg-white/90 text-slate-900 rounded-full p-2">−</button>
          <button onClick={resetZoom} className="bg-white/90 text-slate-900 rounded-full p-2">Reset</button>
          <button onClick={zoomIn} className="bg-white/90 text-slate-900 rounded-full p-2">+</button>
        </div>
        <div className="w-full h-full flex items-center justify-center overflow-hidden bg-black rounded">
          <img
            src={lightboxSrc}
            alt="preview"
            style={{ transform: `scale(${zoom})`, transition: 'transform 120ms ease-out', maxWidth: 'none' }}
            className="select-none pointer-events-none"
            onDoubleClick={resetZoom}
          />
        </div>
      </div>
    </div>
  )}

  {/* Bill of Materials Section */}
  <section
    className="snap-start flex items-center justify-center px-4 pt-20"
    style={{ minHeight: 'calc(100vh - 60px)' }}
  >
    <div className="max-w-7xl mx-auto w-full">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-white text-center mb-12 mt-8"
      >
        Bill of Materials
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-effect rounded-xl p-8"
      >
        <div className="text-center mb-8">
          <p className="text-ocean-100 text-lg mb-6">
            Complete component breakdown and cost analysis for the hardware implementation
          </p>
          <a
            href="/BOM_SIH_2025.xlsx"
            download
            className="inline-flex items-center px-6 py-3 bg-ocean-500 hover:bg-ocean-400 text-white font-semibold rounded-lg transition-colors duration-300"
          >
            <Download className="h-5 w-5 mr-2" />
            Download BOM Excel
          </a>
        </div>
        
        {/* Sample BOM preview table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="border-b border-ocean-400">
                <th className="py-3 px-4 text-ocean-200">Sr</th>
                <th className="py-3 px-4 text-ocean-200">Component</th>
                <th className="py-3 px-4 text-ocean-200">Specs</th>
                <th className="py-3 px-4 text-ocean-200">Cost</th>
                <th className="py-3 px-4 text-ocean-200">Link</th>
              </tr>
            </thead>
            <tbody>
              {fallbackBOM.map((item, index) => (
                <tr key={index} className="border-b border-ocean-600/50">
                  <td className="py-3 px-4">{item.sr}</td>
                  <td className="py-3 px-4">{item.component}</td>
                  <td className="py-3 px-4">{item.specs}</td>
                  <td className="py-3 px-4">{item.cost}</td>
                  <td className="py-3 px-4">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-ocean-300 hover:text-ocean-100 underline">
                      Link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  </section>

  {/* Approach Section (Carousel) */}
  <section
    className="snap-start flex items-center justify-center px-4"
    style={{ minHeight: 'calc(100vh - 60px)', paddingTop: 'calc(var(--navbar-height) + 2rem)' }}
  >
    <div className="max-w-3xl mx-auto w-full relative">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-white text-center mb-12"
      >
        Software Approach
      </motion.h2>

      {/* Carousel Card (text-only, full content area) */}
      <motion.div
        key={softwareSlides[currentSoftware].id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer h-96"
        style={{ background: 'none' }}
        onClick={() => handleCardClick(softwareSlides[currentSoftware])}
      >
        <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-ocean-700/80 to-ocean-900/80">
          <h3 className="text-3xl font-bold text-white mb-4">{softwareSlides[currentSoftware].name}</h3>
          <p className="text-ocean-100 text-base max-w-2xl">
            {getParagraphs(softwareSlides[currentSoftware].description)[0]}
          </p>
          <div className="mt-4 text-ocean-200 text-xs">Tap to read more</div>
        </div>
      </motion.div>
      {/* Modal handled globally below */}
    </div>
  </section>

  <section
    className="snap-start flex items-center justify-center px-4"
    style={{ minHeight: 'calc(100vh - 60px)' }}
  >
    <div className="max-w-3xl mx-auto w-full relative">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-white text-center mb-12"
      >
         Hardware Approach
      </motion.h2>

      {/* Carousel Card (text-only, full content area) */}
      <motion.div
        key={hardwareSlides[currentHardware].id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer h-96"
        style={{ background: 'none' }}
        onClick={() => handleCardClick(hardwareSlides[currentHardware])}
      >
        <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-ocean-700/80 to-ocean-900/80">
          <h3 className="text-3xl font-bold text-white mb-4">{hardwareSlides[currentHardware].name}</h3>
          <p className="text-ocean-100 text-base max-w-2xl">
            {getParagraphs(hardwareSlides[currentHardware].description)[0]}
          </p>
          <div className="mt-4 text-ocean-200 text-xs">Tap to read more</div>
        </div>
      </motion.div>
      {/* Modal handled globally below */}
    </div>
  </section>

  {/* Unified Modal Popup for both carousels (text-only) */}
  {showModal && modalCard && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative w-[85vw] h-[85vh] flex flex-col">
        <button
          className="absolute top-4 right-4 text-ocean-600 bg-white rounded-full p-2 shadow hover:bg-ocean-100 z-10"
          onClick={closeModal}
        >
          &#10005;
        </button>
        <div className="p-8 overflow-y-auto h-full">
          <h2 className="text-3xl font-bold text-ocean-700 mb-4 text-center">{modalCard.name}</h2>
          <div className="text-lg text-gray-700 mb-6 text-center space-y-4 max-w-4xl mx-auto">
            {getParagraphs(modalCard.description).map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
          {modalCard.metrics && (
            <div className="flex justify-center flex-wrap gap-3">
              {Object.entries(modalCard.metrics).map(([key, value]) => (
                <div key={key} className="bg-ocean-100 rounded-lg px-4 py-2 text-ocean-700 font-semibold">
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )}

  {/* Pipeline Section */}
  <section
    className="snap-start flex items-center justify-center px-4 bg-gradient-to-b from-ocean-900 to-ocean-800"
    style={{ minHeight: 'calc(100vh - 60px)' }}
  >
    <div className="max-w-6xl mx-auto w-full">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-white text-center mb-16"
      >
        Processing Pipeline
      </motion.h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {pipelineStages.map((stage, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="text-center relative p-6 glass-effect rounded-xl"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">{index + 1}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">{stage.name}</h3>
            <p className="text-ocean-100 text-sm leading-relaxed">{stage.description}</p>

            {index < pipelineStages.length - 1 && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "4rem", opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="hidden lg:block absolute top-10 left-full h-0.5 bg-white/40 transform -translate-y-1/2"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Performance Metrics */}
  <section
    className="snap-start flex items-center justify-center px-4 bg-white/5 backdrop-blur-sm"
    style={{ minHeight: 'calc(100vh - 60px)', paddingTop: '80px' }}
  >
    <div className="max-w-7xl mx-auto w-full">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-white text-center mb-16"
      >
        Performance Metrics
      </motion.h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {impactMetrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-center glass-effect rounded-xl p-10 flex flex-col items-center justify-center"
          >
            <metric.icon className="h-14 w-14 text-white mb-6" />
            <div className="text-5xl font-extrabold text-white mb-3">{metric.value}</div>
            <div className="text-lg text-ocean-200">{metric.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Team Section */}
  <section
    className="snap-start flex items-center justify-center px-4"
    style={{ minHeight: 'calc(100vh - 60px)', paddingTop: '80px' }}
  >
    <div className="max-w-7xl mx-auto w-full">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-white text-center mb-12"
      >
        Our Team
      </motion.h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-center glass-effect rounded-2xl p-10 flex flex-col items-center shadow-xl hover:scale-105 transition-transform duration-300"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br from-ocean-400 to-ocean-600">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none" }}
              />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
            <p className="text-ocean-200 text-sm mb-4">{member.role}</p>
            <div className="flex space-x-4 mt-2">
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-ocean-200 hover:text-ocean-400 transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
              {member.github && (
                <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-ocean-200 hover:text-ocean-400 transition-colors">
                  <Github className="h-6 w-6" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

{/* Downloads Section */}
<section
  className="snap-start py-16 px-4 bg-white/5 backdrop-blur-sm"
  style={{ minHeight: 'calc(100vh - 60px)' }}
>
  <div className="max-w-7xl mx-auto">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-4xl font-bold text-white text-center mb-12"
    >
      Downloads
    </motion.h2>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        {
          name: "Deep Dataset",
          description: "Original deep dataset for phytoplankton enumeration without overlap.",
          size: "209 MB",
          url: "https://huggingface.co/datasets/TheDeepDas/Phytoplanktons-Enumeration-Without-Overlap/resolve/main/deep%20dataset.zip"
        },
        {
          name: "Deep Large Dataset",
          description: "Larger version of the deep dataset for training high-capacity models.",
          size: "2.1 GB",
          url: "https://huggingface.co/datasets/TheDeepDas/Phytoplanktons-Enumeration-Without-Overlap/resolve/main/deep%20large%20dataset.zip"
        },
        {
          name: "Pre-processed Dataset without Overlap",
          description: "Dataset with preprocessing applied for faster training and evaluation.",
          size: "2.55 GB",
          url: "https://huggingface.co/datasets/TheDeepDas/Phytoplanktons-Enumeration-Without-Overlap/resolve/main/pre-processed%20dataset.zip"
        },
        {
          name: "Deep Dataset with Overlap",
          description: "Original deep dataset including overlapping phytoplanktons.",
          size: "28.1 MB",
          url: "https://huggingface.co/datasets/TheDeepDas/Phytoplankton-Enumeration/resolve/main/deep%20dataset%20with%20overlap.zip"
        },
        {
          name: "Deep Large Dataset with Overlap",
          description: "Large dataset including overlapping phytoplanktons for advanced models.",
          size: "285 MB",
          url: "https://huggingface.co/datasets/TheDeepDas/Phytoplankton-Enumeration/resolve/main/deep%20large%20dataset%20with%20overlap.zip"
        },
        {
          name: "Pre-Processing Model",
          description: "Model for preprocessing phytoplankton images.",
          size: "127 KB",
          url: "https://huggingface.co/TheDeepDas/Phytoplankton-Models/blob/main/phytoplankton_preprocessing_pipeline.pkl"
        },
        {
          name: "Model 1 of Stacking Ensemble",
          description: "Model for classifying phytoplankton images.",
          size: "9.34 MB",
          url: "https://huggingface.co/TheDeepDas/Phytoplankton-Models/blob/main/mobilenetv2_regression.pth"
        },
        {
          name: "Model 2 of Stacking Ensemble",
          description: "Model for enumerating phytoplankton images.",
          size: "43 MB",
          url: "https://huggingface.co/TheDeepDas/Phytoplankton-Models/blob/main/resnet18_regression.pth"
        },
        {
          name: "Final Ensemble Model",
          description: "Final Ensemble Model for phytoplankton images.",
          size: "254 KB",
          url: "https://huggingface.co/TheDeepDas/Phytoplankton-Models/blob/main/phytoplankton_stacking_ensemble.pkl"
        },
        {
          name: "Complete Pipeline Model",
          description: "Complete Pipeline Model for phytoplankton images.",
          size: "52.5 MB",
          url: "https://huggingface.co/TheDeepDas/Phytoplankton-Models/blob/main/phytoplankton_full_pipeline.pkl"
        }
      ].map((file, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="glass-effect rounded-xl p-6 hover:bg-white/20 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-lg">{file.name}</h3>
              <ExternalLink className="h-5 w-5 text-ocean-200" />
            </div>
            <p className="text-ocean-100 text-sm mb-4">{file.description}</p>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-ocean-200 text-sm">{file.size}</span>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ocean-500 hover:bg-ocean-400 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>



{/* Footer */}
<footer className="py-8 px-4 border-t border-white/10">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="max-w-7xl mx-auto text-center"
  >
    <div className="flex items-center justify-center space-x-2 mb-4">
      <Waves className="h-6 w-6 text-white" />
      <span className="text-white font-semibold">Medhavi</span>
    </div>
    <p className="text-ocean-200 text-sm">
      Advancing marine biology research through intelligent microscopy systems
    </p>
  </motion.div>
</footer>

    </div>
  )
}

export default Showcase
