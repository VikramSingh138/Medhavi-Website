import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const isLab = location.pathname === '/run'

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isLab ? 'bg-gray-900/90 backdrop-blur-md' : 'bg-ocean-600/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3" aria-label="Home">
            {/* Brand Logo from public/medhavi.png */}
            <img
              src="/medhavi.png"
              alt="Medhavi Logo"
              className="h-16 w-16 rounded-md shadow-sm object-contain bg-white/0"
            />
            <span className={`font-bold text-lg ${isLab ? 'text-neon-cyan' : 'text-white'}`}>
              Medhavi
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? (isLab ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-white border-b-2 border-white')
                    : (isLab ? 'text-gray-300 hover:text-neon-cyan' : 'text-ocean-100 hover:text-white')
                }`}
              >
                Showcase
              </Link>
              <Link
                to="/run"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/run' 
                    ? 'text-neon-cyan border-b-2 border-neon-cyan'
                    : (isLab ? 'text-gray-300 hover:text-neon-cyan' : 'text-ocean-100 hover:text-white')
                }`}
              >
                Run Model
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${isLab ? 'text-neon-cyan' : 'text-white'}`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className={`md:hidden ${isLab ? 'bg-gray-900' : 'bg-ocean-600'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/' 
                  ? (isLab ? 'text-neon-cyan bg-gray-800' : 'text-white bg-ocean-700')
                  : (isLab ? 'text-gray-300 hover:text-neon-cyan hover:bg-gray-800' : 'text-ocean-100 hover:text-white hover:bg-ocean-700')
              }`}
              onClick={() => setIsOpen(false)}
            >
              Showcase
            </Link>
            <Link
              to="/run"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/run' 
                  ? 'text-neon-cyan bg-gray-800'
                  : (isLab ? 'text-gray-300 hover:text-neon-cyan hover:bg-gray-800' : 'text-ocean-100 hover:text-white hover:bg-ocean-700')
              }`}
              onClick={() => setIsOpen(false)}
            >
              Run Model
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar