import React from 'react'
import { Link } from 'react-router'

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-forest-green opacity-90 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%27 height=%2720%27 viewBox=%270 0 20 20%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.05%27%3E%3Cpolygon points=%272 0 0 2 0 20 2 20 2 2 20 2 20 0 2 0%27/%3E%3C/g%3E%3C/svg%3E')] opacity-10 z-0"></div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to amplify your event's reach?
        </h2>
        
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of event organizers turning attendees into brand ambassadors today.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/signup" 
            className="bg-white text-forest-green px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
          <Link 
            to="/demo" 
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
          >
            Book a Demo
          </Link>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-sm text-white/70">
          No credit card required • Free plan available
        </p>
      </div>
    </section>
  )
}

export default CTASection
