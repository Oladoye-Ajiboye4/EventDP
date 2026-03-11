import React from 'react'

const SocialProofSection = () => {
  const companies = [
    { name: 'TechFlow', icon: '⚠️' },
    { name: 'SummitOne', icon: '⚡' },
    { name: 'DevFest', icon: '🔌' },
    { name: 'GlobalMeet', icon: '🌐' },
    { name: 'FutureCon', icon: '🧠' },
  ]

  return (
    <section className="py-10 border-y border-forest-green/10 bg-white/50 dark:bg-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-text-muted uppercase tracking-wider mb-6">
          Powering events for innovative teams
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
          {companies.map((company, index) => (
            <div key={index} className="flex items-center gap-2 font-bold text-xl text-dark-slate dark:text-white">
              <span className="text-2xl">{company.icon}</span> 
              {company.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SocialProofSection
