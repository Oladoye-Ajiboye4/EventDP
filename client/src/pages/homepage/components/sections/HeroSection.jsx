import React from 'react'
import { Link } from 'react-router'

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Hero Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-green/10 border border-forest-green/20 text-forest-green text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-forest-green animate-pulse"></span>
              New: AI-Powered Frame Generator
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-dark-slate dark:text-white leading-[1.1] mb-6">
              Turn Your Attendees into Your Biggest{' '}
              <span className="text-forest-green relative inline-block">
                Promoters
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-forest-green/30" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path>
                </svg>
              </span>
              .
            </h1>

            {/* Description */}
            <p className="text-lg text-text-muted dark:text-gray-400 mb-8 leading-relaxed max-w-lg">
              Create stunning, branded display picture frames that your event attendees will love to share on social media. No design skills required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="bg-forest-green hover:bg-[#48614F] text-white text-center px-8 py-3.5 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-forest-green/25 hover:shadow-forest-green/40 flex items-center justify-center gap-2">
                Create Your First Frame
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="#demo" className="bg-white dark:bg-gray-800 text-dark-slate dark:text-white border border-gray-200 dark:border-gray-700 text-center px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-forest-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                View Demo
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex items-center gap-4 text-sm text-text-muted dark:text-gray-500">
              <div className="flex -space-x-2">
                <img alt="User avatar 1" className="w-8 h-8 rounded-full border-2 border-pale-sage dark:border-gray-900" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop" />
                <img alt="User avatar 2" className="w-8 h-8 rounded-full border-2 border-pale-sage dark:border-gray-900" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop" />
                <img alt="User avatar 3" className="w-8 h-8 rounded-full border-2 border-pale-sage dark:border-gray-900" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop" />
              </div>
              <p>Trusted by 2,000+ event organizers</p>
            </div>
          </div>

          {/* Hero Visual - Interactive Slider Concept */}
          <div className="relative lg:h-150 flex items-center justify-center">
            {/* Decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-linear-to-tr from-forest-green/20 to-transparent rounded-full blur-3xl -z-10"></div>

            {/* Card Container */}
            <div className="relative w-full max-w-md aspect-4/5 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
              {/* Top Header */}
              <div className="absolute top-0 left-0 right-0 p-6 z-20 pointer-events-none">
                <div className="flex justify-between items-center text-white drop-shadow-md">
                  <span className="font-bold text-xl">TechSummit '24</span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">Official Badge</span>
                </div>
              </div>

              {/* The Full Frame Image */}
              <div className="absolute inset-0 z-0">
                <img alt="Professional woman" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop" />
                {/* Overlay Frame */}
                <div className="absolute inset-0 border-20 border-forest-green/90 flex flex-col justify-end pb-8 items-center bg-gradient-overlay">
                  <div className="text-white text-center">
                    <h3 className="text-2xl font-bold">SPEAKER</h3>
                    <p className="text-sm opacity-90">October 12-14 • San Francisco</p>
                  </div>
                </div>
              </div>

              {/* The Before Image (Left Half) */}
              <div className="absolute inset-0 z-10 overflow-hidden w-1/2 border-r-4 border-white">
                <img alt="Professional woman raw" className="w-full h-full object-cover max-w-none" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop" style={{ width: '200%' }} />
                <div className="absolute bottom-6 left-6 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  Original Photo
                </div>
              </div>

              {/* Slider Handle */}
              <div className="absolute inset-y-0 left-1/2 w-10 -ml-5 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-forest-green">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l4-4v4h4V9l4 4V5z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 md:right-0 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-[200px] animate-bounce-slow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-dark-slate dark:text-white">Ready to share!</p>
                  <p className="text-xs text-text-muted">Optimized for LinkedIn & Twitter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
