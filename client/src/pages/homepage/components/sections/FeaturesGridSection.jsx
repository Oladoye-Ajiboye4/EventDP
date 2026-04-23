import React from 'react'

const FeatureCard = ({ icon, title, description }) => (
  <div data-animate data-gsap-hover data-gsap-tilt className="bg-white dark:bg-gray-800 p-5 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-forest-green/5 hover:border-forest-green/20 hover:shadow-md transition-all group will-change-transform">
    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-forest-green/10 rounded-xl flex items-center justify-center text-forest-green mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-dark-slate dark:text-white mb-2 sm:mb-3">
      {title}
    </h3>
    <p className="text-sm sm:text-base text-text-muted dark:text-gray-400 leading-relaxed">
      {description}
    </p>
  </div>
)

const FeaturesGridSection = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2zm4-4h2v20h-2z" />
        </svg>
      ),
      title: 'Instant Customization',
      description: 'Upload your logo, choose your brand colors, and drag-and-drop elements. Our editor makes it impossible to design a bad frame.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.56 9.31 6.88 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.88 0 1.56-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
        </svg>
      ),
      title: 'One-Click Viral Sharing',
      description: 'Attendees can generate their DP and share directly to LinkedIn, Twitter, and WhatsApp with pre-filled hashtags and captions.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9.5c0 .83-.67 1.5-1.5 1.5S11 13.33 11 12.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm3.5 6H5V5h14v13.5z" />
        </svg>
      ),
      title: 'Real-Time Analytics',
      description: 'Track how many attendees generate frames, download them, and share them. Measure the true reach of your event marketing.',
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 relative" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div data-animate className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-slate dark:text-white mb-3 sm:mb-4">
            Everything you need to go viral
          </h2>
          <p className="text-base sm:text-lg text-text-muted dark:text-gray-400">
            Design, distribute, and track your event frames all in one dashboard.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesGridSection
