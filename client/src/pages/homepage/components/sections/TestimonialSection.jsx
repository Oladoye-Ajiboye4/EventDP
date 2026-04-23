import React from 'react'

const TestimonialSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-forest-green/5 dark:bg-forest-green/10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Quote Icon */}
        <svg data-animate className="w-10 h-10 sm:w-12 sm:h-12 text-forest-green/30 mb-5 sm:mb-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.716-5-7-5-3 0-7 3.75-7 5v3C-4.3 9 3 13.4 9 17c0 .015.122.645.122 1-.122 1-1.395 1-3 1-1 0-4.684-.861-7-1V20c2 1 6.566 2 9 2z" />
        </svg>

        {/* Quote Text */}
        <p data-animate data-gsap-hover className="text-xl sm:text-2xl md:text-3xl font-medium text-dark-slate dark:text-white mb-7 sm:mb-8 italic leading-relaxed">
          "We saw a <span className="text-forest-green font-bold">300% increase</span> in organic social mentions just by using EventDP for our annual conference. The attendees loved showing off their badges."
        </p>

        {/* Author Info */}
        <div data-animate data-gsap-hover className="flex items-center justify-center gap-3 sm:gap-4">
          <img
            alt="Sarah Jenkins"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-forest-green/20"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop"
          />
          <div className="text-left">
            <div className="font-bold text-dark-slate dark:text-white">
              Sarah Jenkins
            </div>
            <div className="text-sm text-text-muted dark:text-gray-400">
              Marketing Director, TechFlow
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection
