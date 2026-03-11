import React from 'react'
import { Link } from 'react-router'

const Footer = () => {
  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Showcase', href: '#showcase' },
      { label: 'Changelog', href: '#changelog' },
    ],
    Resources: [
      { label: 'Blog', href: '#blog' },
      { label: 'Community', href: '#community' },
      { label: 'Help Center', href: '#help' },
      { label: 'API Docs', href: '#api' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Legal', href: '/legal' },
      { label: 'Contact', href: '/contact' },
    ],
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-forest-green flex items-center justify-center text-white font-bold text-lg">
                E
              </div>
              <span className="font-bold text-xl tracking-tight">EventDP</span>
            </Link>
            
            <p className="text-gray-400 max-w-xs mb-6">
              The easiest way to create branded event frames and turn your attendees into promoters.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#facebook" className="text-gray-400 hover:text-forest-green transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#twitter" className="text-gray-400 hover:text-forest-green transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 002.856-3.915 10 10 0 01-2.956 1.745 5 5 0 00-8.618 4.57A14.129 14.129 0 012.678 3.04a5 5 0 001.548 6.676 4.992 4.992 0 01-2.265-.567v.063a5 5 0 004.008 4.907 5 5 0 01-2.252.089 5 5 0 004.697 3.472 10.009 10.009 0 01-6.175 2.139c-.399 0-.779-.023-1.17-.067a14.047 14.047 0 007.646 2.212c9.176 0 14.18-7.591 14.18-14.18 0-.216-.005-.432-.015-.648a10.12 10.12 0 002.479-2.558z" />
                </svg>
              </a>
              <a href="#youtube" className="text-gray-400 hover:text-forest-green transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.654c-1.318-.049-4.953-.049-6.269-.049H9.654c-1.317 0-4.952 0-6.27.049C1.231 3.708 0 5.098 0 7.991v8.018c0 2.893 1.231 4.283 2.385 4.337c1.318.05 4.953.05 6.27.05h3.692c1.317 0 4.952 0 6.269-.05 1.154-.054 2.385-1.444 2.385-4.337V7.99C21.917 5.098 20.761 3.708 19.615 3.654zm-11.671 12.278v-7.514l4.951 3.795-4.951 3.719z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Footer Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold mb-4 text-gray-200">
                {category}
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {links.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="hover:text-forest-green transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2024 EventDP Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
