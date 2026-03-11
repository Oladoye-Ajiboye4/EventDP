import React from 'react'

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      title: 'Create a campaign',
      description: 'Set up your event branding, upload assets, and configure the frame style in minutes.',
    },
    {
      number: 2,
      title: 'Share the link',
      description: 'Send a unique link to your attendees via email or social media.',
    },
    {
      number: 3,
      title: 'Watch the buzz grow',
      description: 'Attendees generate their DP and flood social timelines with your event branding.',
    },
  ]

  return (
    <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden" id="demo">
      {/* Decorative slant shape */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-forest-green/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Demo Section - Order 2 on desktop, 1 on mobile */}
          <div className="order-2 lg:order-1">
            <div className="bg-pale-sage dark:bg-gray-800 p-2 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              {/* Mock UI */}
              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                  <h4 className="font-bold text-lg text-dark-slate dark:text-white">
                    Frame Generator
                  </h4>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>

                {/* Generator Content */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Upload Section */}
                  <div className="flex-1 space-y-4">
                    <label className="block text-sm font-medium text-text-muted mb-1">
                      Upload Photo
                    </label>
                    <div className="border-2 border-dashed border-forest-green/30 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-forest-green/5 cursor-pointer hover:bg-forest-green/10 transition-colors h-48">
                      <svg className="w-8 h-8 text-forest-green mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                      </svg>
                      <span className="text-xs text-forest-green font-medium">Click to upload</span>
                    </div>

                    {/* Frame Style */}
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-text-muted mb-2">
                        Frame Style
                      </label>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded border-2 border-forest-green bg-forest-green/20 cursor-pointer"></div>
                        <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 cursor-pointer hover:border-forest-green/50 transition-colors"></div>
                        <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 cursor-pointer hover:border-forest-green/50 transition-colors"></div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="w-full md:w-48 shrink-0 flex flex-col items-center">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-linear-to-br from-forest-green/30 to-dusty-green/30 flex items-center justify-center">
                      <svg className="w-16 h-16 text-forest-green/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                      <div className="absolute inset-0 border-8 border-forest-green/80 rounded-full pointer-events-none"></div>
                      <div className="absolute bottom-2 left-0 right-0 text-center bg-forest-green text-[8px] text-white py-0.5 px-1">
                        ATTENDEE
                      </div>
                    </div>
                    <button className="w-full bg-forest-green text-white py-2 rounded-lg text-sm font-medium shadow-lg shadow-forest-green/30 hover:shadow-forest-green/50 transition-all transform hover:-translate-y-0.5">
                      Download DP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Steps Section - Order 1 on desktop, 2 on mobile */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-slate dark:text-white mb-6">
              Simple for you.
              <br />
              Effortless for them.
            </h2>

            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-forest-green/20 text-forest-green flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-slate dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-text-muted dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
