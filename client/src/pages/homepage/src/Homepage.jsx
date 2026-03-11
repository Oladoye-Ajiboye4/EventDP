import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/sections/HeroSection'
import SocialProofSection from '../components/sections/SocialProofSection'
import FeaturesGridSection from '../components/sections/FeaturesGridSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'
import TestimonialSection from '../components/sections/TestimonialSection'
import CTASection from '../components/sections/CTASection'
import Footer from '../components/sections/Footer'

const Homepage = () => {
  return (
    <div className="min-h-screen bg-pale-sage dark:bg-gray-950 text-dark-slate dark:text-gray-100">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <SocialProofSection />
        <FeaturesGridSection />
        <HowItWorksSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default Homepage