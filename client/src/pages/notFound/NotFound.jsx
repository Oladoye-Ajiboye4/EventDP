import React from 'react'
import { Link } from 'react-router'

const quickLinks = [
    {
        label: 'Go Home',
        to: '/',
        className: 'bg-forest-green hover:bg-[#48614F] text-white',
    },
    {
        label: 'Open Dashboard',
        to: '/dashboard',
        className: 'bg-white text-dark-slate hover:bg-gray-100 border border-gray-200',
    },
    {
        label: 'Sign In',
        to: '/signin',
        className: 'bg-dark-slate text-white hover:bg-black',
    },
]

const NotFound = () => {
    return (
        <main className="min-h-screen bg-linear-to-br from-[#f3f7f4] via-[#eef5ff] to-[#f9f5ee] flex items-center justify-center px-4 py-16">
            <section className="w-full max-w-3xl relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl shadow-gray-300/30 p-6 sm:p-10">
                <div className="absolute -top-24 -right-20 w-56 h-56 rounded-full bg-forest-green/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-blue-300/30 blur-3xl" />

                <div className="relative z-10">
                    <p className="inline-flex items-center rounded-full bg-red-50 text-red-700 px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase border border-red-100">
                        Error 404
                    </p>

                    <h1 className="mt-4 text-4xl sm:text-5xl font-black text-dark-slate leading-tight">
                        This page wandered off the route map.
                    </h1>

                    <p className="mt-4 text-base sm:text-lg text-text-muted max-w-2xl">
                        The link might be outdated or typed incorrectly. Use one of the quick links below to get back into EventDP.
                    </p>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        {quickLinks.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`rounded-xl px-4 py-3 text-center font-semibold transition-all shadow-sm hover:shadow-md ${item.className}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}

export default NotFound
