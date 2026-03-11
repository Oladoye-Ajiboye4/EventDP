import React, { useState } from 'react'
import { Link } from 'react-router'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed w-full z-50 bg-pale-sage/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-forest-green/10 dark:border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-forest-green flex items-center justify-center text-white font-bold text-lg">
              E
            </div>
            <span className="font-bold text-xl tracking-tight text-dark-slate dark:text-white">
              EventDP
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#features" className="text-text-muted dark:text-gray-400 hover:text-forest-green dark:hover:text-forest-green font-medium transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-text-muted dark:text-gray-400 hover:text-forest-green dark:hover:text-forest-green font-medium transition-colors">
              Pricing
            </a>
            <a href="#showcase" className="text-text-muted dark:text-gray-400 hover:text-forest-green dark:hover:text-forest-green font-medium transition-colors">
              Showcase
            </a>
            <a href="#blog" className="text-text-muted dark:text-gray-400 hover:text-forest-green dark:hover:text-forest-green font-medium transition-colors">
              Blog
            </a>
          </div>

          {/* CTA - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-dark-slate dark:text-white font-medium hover:text-forest-green transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="bg-forest-green hover:bg-[#48614F] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-forest-green/20 hover:shadow-forest-green/40">
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-dark-slate dark:text-white hover:text-forest-green focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#features" className="block px-4 py-2 text-text-muted hover:text-forest-green rounded-lg transition-colors">
              Features
            </a>
            <a href="#pricing" className="block px-4 py-2 text-text-muted hover:text-forest-green rounded-lg transition-colors">
              Pricing
            </a>
            <a href="#showcase" className="block px-4 py-2 text-text-muted hover:text-forest-green rounded-lg transition-colors">
              Showcase
            </a>
            <a href="#blog" className="block px-4 py-2 text-text-muted hover:text-forest-green rounded-lg transition-colors">
              Blog
            </a>
            <div className="pt-2 space-y-2">
              <Link to="/login" className="block px-4 py-2 text-dark-slate hover:text-forest-green rounded-lg transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="block px-4 py-2 bg-forest-green text-white rounded-lg font-medium hover:bg-[#48614F] transition-all text-center">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar