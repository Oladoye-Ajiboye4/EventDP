import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/Navbar'
import HeroSection from '../components/sections/HeroSection'
import SocialProofSection from '../components/sections/SocialProofSection'
import FeaturesGridSection from '../components/sections/FeaturesGridSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'
import TestimonialSection from '../components/sections/TestimonialSection'
import CTASection from '../components/sections/CTASection'
import Footer from '../components/sections/Footer'

const Homepage = () => {
  const pageRef = useRef(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const cleanupFns = []

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('[data-home-section]')
      const storyGroups = gsap.utils.toArray('[data-story-stage]')
      const hoverTargets = gsap.utils.toArray('[data-gsap-hover]')
      const tiltTargets = gsap.utils.toArray('[data-gsap-tilt]')
      const magneticTargets = gsap.utils.toArray('[data-gsap-magnetic]')

      const addListener = (el, eventName, handler) => {
        el.addEventListener(eventName, handler)
        cleanupFns.push(() => el.removeEventListener(eventName, handler))
      }

      const sectionPresets = {
        hero: {
          y: 36,
          duration: 0.95,
          ease: 'power4.out',
          start: 'top 92%',
        },
        proof: {
          y: 18,
          duration: 0.7,
          ease: 'power2.out',
          start: 'top 90%',
        },
        features: {
          y: 48,
          duration: 0.85,
          ease: 'power3.out',
          start: 'top 90%',
        },
        story: {
          y: 52,
          duration: 0.95,
          ease: 'power3.out',
          start: 'top 88%',
        },
        testimonial: {
          y: 24,
          duration: 0.75,
          ease: 'back.out(1.2)',
          start: 'top 90%',
        },
        cta: {
          y: 42,
          duration: 0.8,
          ease: 'power3.out',
          start: 'top 92%',
        },
        footer: {
          y: 16,
          duration: 0.65,
          ease: 'power2.out',
          start: 'top 95%',
        },
      }

      sections.forEach((section) => {
        const motion = section.dataset.motion || 'default'
        const preset = sectionPresets[motion] || {
          y: 32,
          duration: 0.8,
          ease: 'power3.out',
          start: 'top 90%',
        }
        const contentItems = section.querySelectorAll('[data-animate]')

        gsap.fromTo(
          section,
          { autoAlpha: 0, y: preset.y, scale: motion === 'proof' ? 0.985 : 1 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: preset.duration,
            ease: preset.ease,
            scrollTrigger: {
              trigger: section,
              start: preset.start,
              end: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        if (motion === 'hero') {
          const heroVisual = section.querySelector('[data-hero-visual]')
          const heroBadge = section.querySelector('[data-hero-badge]')
          const heroHeadline = section.querySelector('[data-hero-headline]')

          if (heroVisual) {
            gsap.fromTo(
              heroVisual,
              { x: 28, rotate: 2, scale: 0.96, autoAlpha: 0 },
              {
                x: 0,
                rotate: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 1.1,
                ease: 'power4.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 90%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }

          if (heroBadge) {
            gsap.fromTo(
              heroBadge,
              { autoAlpha: 0, y: 16, scale: 0.92 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.8)',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 90%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }

          if (heroHeadline) {
            gsap.fromTo(
              heroHeadline,
              { textShadow: '0 0 0 rgba(90, 120, 99, 0)' },
              {
                textShadow: '0 0 18px rgba(90, 120, 99, 0.16)',
                duration: 1.2,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 90%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }
        }

        if (contentItems.length > 0) {
          gsap.fromTo(
            contentItems,
            { autoAlpha: 0, y: motion === 'cta' ? 22 : 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: motion === 'hero' ? 0.75 : 0.7,
              ease: 'power2.out',
              stagger: motion === 'hero' ? 0.12 : 0.09,
              scrollTrigger: {
                trigger: section,
                start: motion === 'footer' ? 'top 95%' : 'top 88%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      })

      storyGroups.forEach((group) => {
        const storyItems = group.querySelectorAll('[data-story-item]')
        const storyLine = group.querySelector('[data-story-line]')

        if (storyLine) {
          gsap.fromTo(
            storyLine,
            { scaleY: 0, transformOrigin: 'top center' },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: group,
                start: 'top 82%',
                end: 'bottom 45%',
                scrub: 1,
              },
            }
          )
        }

        if (storyItems.length > 0) {
          gsap.fromTo(
            storyItems,
            { autoAlpha: 0, x: -24 },
            {
              autoAlpha: 1,
              x: 0,
              stagger: 0.2,
              ease: 'power3.out',
              duration: 0.7,
              scrollTrigger: {
                trigger: group,
                start: 'top 84%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      })

      hoverTargets.forEach((target) => {
        addListener(target, 'mouseenter', () => {
          gsap.to(target, {
            y: -6,
            scale: 1.02,
            boxShadow: '0 24px 44px rgba(34, 68, 52, 0.18)',
            duration: 0.28,
            ease: 'power2.out',
          })
        })

        addListener(target, 'mouseleave', () => {
          gsap.to(target, {
            y: 0,
            scale: 1,
            boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
            duration: 0.35,
            ease: 'power2.out',
          })
        })
      })

      tiltTargets.forEach((target) => {
        addListener(target, 'mousemove', (event) => {
          const rect = target.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const rotateY = ((event.clientX - centerX) / rect.width) * 8
          const rotateX = -((event.clientY - centerY) / rect.height) * 8

          gsap.to(target, {
            rotateX,
            rotateY,
            transformPerspective: 900,
            transformOrigin: 'center',
            duration: 0.35,
            ease: 'power2.out',
          })
        })

        addListener(target, 'mouseleave', () => {
          gsap.to(target, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.45,
            ease: 'power3.out',
          })
        })
      })

      magneticTargets.forEach((target) => {
        addListener(target, 'mousemove', (event) => {
          const rect = target.getBoundingClientRect()
          const moveX = ((event.clientX - rect.left) / rect.width - 0.5) * 16
          const moveY = ((event.clientY - rect.top) / rect.height - 0.5) * 14

          gsap.to(target, {
            x: moveX,
            y: moveY,
            duration: 0.25,
            ease: 'power2.out',
          })
        })

        addListener(target, 'mouseleave', () => {
          gsap.to(target, {
            x: 0,
            y: 0,
            duration: 0.4,
            ease: 'power3.out',
          })
        })
      })
    }, pageRef)

    return () => {
      cleanupFns.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  return (
    <div ref={pageRef} className="min-h-screen bg-pale-sage dark:bg-gray-950 text-dark-slate dark:text-gray-100">
      <Navbar />
      <main className="pt-16">
        <div data-home-section data-motion="hero">
          <HeroSection />
        </div>
        <div data-home-section data-motion="proof">
          <SocialProofSection />
        </div>
        <div data-home-section data-motion="features">
          <FeaturesGridSection />
        </div>
        <div data-home-section data-motion="story">
          <HowItWorksSection />
        </div>
        <div data-home-section data-motion="testimonial">
          <TestimonialSection />
        </div>
        <div data-home-section data-motion="cta">
          <CTASection />
        </div>
      </main>
      <div data-home-section data-motion="footer">
        <Footer />
      </div>
    </div>
  )
}

export default Homepage