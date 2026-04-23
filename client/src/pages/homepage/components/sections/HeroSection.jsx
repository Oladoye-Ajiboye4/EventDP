import React, { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'

const HeroSection = () => {
  const typeRef = useRef(null)
  const cursorRef = useRef(null)

  useLayoutEffect(() => {
    const phrase = 'Turn Your Attendees into Your Biggest Promoters.'
    const counter = { value: 0 }

    if (!typeRef.current) {
      return undefined
    }

    const typeTween = gsap.to(counter, {
      value: phrase.length,
      duration: 2.6,
      ease: `steps(${phrase.length})`,
      onUpdate: () => {
        const currentLength = Math.floor(counter.value)
        typeRef.current.textContent = phrase.slice(0, currentLength)
      },
    })

    const cursorTween = gsap.to(cursorRef.current, {
      autoAlpha: 0,
      repeat: -1,
      yoyo: true,
      duration: 0.55,
      ease: 'none',
    })

    return () => {
      typeTween.kill()
      cursorTween.kill()
    }
  }, [])

  return (
    <section className="relative overflow-hidden pt-20 pb-14 sm:pt-24 sm:pb-16 lg:pt-40 lg:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Hero Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div data-animate data-hero-badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-green/10 border border-forest-green/20 text-forest-green text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-forest-green animate-pulse"></span>
              New: AI-Powered Frame Generator
            </div>

            {/* Main Heading */}
            <h1 data-animate data-hero-headline className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-dark-slate dark:text-white leading-[1.1] mb-5 sm:mb-6 min-h-[3.2em] sm:min-h-[2.4em] lg:min-h-[2.1em]">
              <span ref={typeRef} className="text-forest-green" />
              <span ref={cursorRef} className="inline-block text-dark-slate dark:text-white ml-0.5">|</span>
            </h1>

            {/* Description */}
            <p data-animate className="text-base sm:text-lg text-text-muted dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed max-w-lg">
              Create stunning, branded display picture frames that your event attendees will love to share on social media. No design skills required.
            </p>

            {/* CTA Buttons */}
            <div data-animate className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/signup" data-gsap-hover data-gsap-magnetic className="bg-forest-green hover:bg-[#48614F] text-white text-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg transition-all shadow-xl shadow-forest-green/25 hover:shadow-forest-green/40 flex items-center justify-center gap-2">
                Create Your First Frame
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/" data-gsap-hover data-gsap-magnetic className="bg-white dark:bg-gray-800 text-dark-slate dark:text-white border border-gray-200 dark:border-gray-700 text-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-forest-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                View Demo
              </Link>
            </div>

            {/* Social Proof */}
            <div data-animate className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-muted dark:text-gray-500">
              <div className="flex -space-x-2">
                <img alt="User avatar 1" className="w-8 h-8 rounded-full border-2 border-pale-sage dark:border-gray-900" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop" />
                <img alt="User avatar 2" className="w-8 h-8 rounded-full border-2 border-pale-sage dark:border-gray-900" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop" />
                <img alt="User avatar 3" className="w-8 h-8 rounded-full border-2 border-pale-sage dark:border-gray-900" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop" />
              </div>
              <p>Trusted by 2,000+ event organizers</p>
            </div>

            <div data-animate className="mt-5 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
              <span data-gsap-hover className="px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 border border-forest-green/20 text-xs sm:text-sm font-medium text-dark-slate dark:text-white">1. Create a branded frame</span>
              <span data-gsap-hover className="px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 border border-forest-green/20 text-xs sm:text-sm font-medium text-dark-slate dark:text-white">2. Share one smart link</span>
              <span data-gsap-hover className="px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 border border-forest-green/20 text-xs sm:text-sm font-medium text-dark-slate dark:text-white">3. Guests post instantly</span>
            </div>
          </div>

          {/* Hero Visual - Interactive Slider Concept */}
          <div data-animate data-hero-visual className="relative lg:h-150 flex items-center justify-center">
            {/* Decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-linear-to-tr from-forest-green/20 to-transparent rounded-full blur-3xl -z-10"></div>

            {/* Card Container */}
            <div data-gsap-hover data-gsap-tilt className="relative w-full max-w-[320px] sm:max-w-md aspect-4/5 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 group will-change-transform">
              {/* Top Header */}
              <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20 pointer-events-none">
                <div className="flex justify-between items-center text-white drop-shadow-md">
                  <span className="font-bold text-base sm:text-xl">TechSummit '24</span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">Official Badge</span>
                </div>
              </div>

              {/* The Full Frame Image */}
              <div className="absolute inset-0 z-0">
                <img alt="Professional woman" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop" />
                {/* Overlay Frame */}
                <div className="absolute inset-0 border-14 sm:border-20 border-forest-green/90 flex flex-col justify-end pb-6 sm:pb-8 items-center bg-gradient-overlay">
                  <div className="text-white text-center">
                    <h3 className="text-xl sm:text-2xl font-bold">SPEAKER</h3>
                    <p className="text-xs sm:text-sm opacity-90">October 12-14 • San Francisco</p>
                  </div>
                </div>
              </div>

              {/* The Before Image (Left Half) */}
              <div className="absolute inset-0 z-10 overflow-hidden w-1/2 border-r-2 sm:border-r-4 border-white">
                <img alt="Professional woman raw" className="w-full h-full object-cover max-w-none" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop" style={{ width: '200%' }} />
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-black/50 text-white text-[10px] sm:text-xs px-2 py-1 rounded backdrop-blur-sm">
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
            <div data-gsap-hover className="hidden sm:block absolute -bottom-5 -right-2 md:right-0 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-50 animate-bounce-slow">
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
