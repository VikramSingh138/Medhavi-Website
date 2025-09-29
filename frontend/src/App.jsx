import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Showcase from './pages/Showcase'
import Lab from './pages/Lab'
import useSilentTracking from './hooks/useSilentTracking'

function App() {
  // Silently track user data when app loads
  useSilentTracking();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="h-12" />
      <Routes>
        <Route path="/" element={<Showcase />} />
        <Route path="/run" element={<Lab />} />
      </Routes>
    </div>
  )
}

export default App