import React, { useState, useEffect, useRef } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { Icon } from '@iconify/react'
import SidebarBrand from './components/navItems/SidebarBrand'
import SidebarProfile from './components/navItems/SidebarProfile'
import NavItemsGroup from './components/navItems/NavItemsGroup'
import { primaryNavItems, secondaryNavItems } from './components/navItems/navItemsConfig'


const Dashboard = () => {
  const dashboardUrl = `${import.meta.env.VITE_BASE_URL}getDashboard`
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [recentEvents, setRecentEvents] = useState([])
  const [eventHistory, setEventHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const hasWelcomedRef = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      errorNotify('No token found. Please sign in again.')
      setTimeout(() => navigate('/signin'), 1500)
      return
    }

    axios.get(dashboardUrl, {
      params: debouncedSearch ? { search: debouncedSearch } : {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        if (result.status === 200) {
          setUser(result.data.user)
          setRecentEvents(Array.isArray(result.data.recentEventDPs) ? result.data.recentEventDPs : [])
          setEventHistory(Array.isArray(result.data.eventHistory) ? result.data.eventHistory : [])
          setLoading(false)
          if (!hasWelcomedRef.current) {
            notify(result.data.user?.username)
            hasWelcomedRef.current = true
          }
        } else if (result.status === 401 || result.status === 500 || result.status === 404) {
          setLoading(false)
          errorNotify(result.data.message)
        } else {
          setLoading(false)
          errorNotify('Unexpected server response. Try again later')
        }
      })
      .catch((error) => {
        setLoading(false)
        errorNotify(error?.response?.data?.message || 'Failed to fetch dashboard data')
      })
  }, [navigate, debouncedSearch])

  const notify = (username) => {
    toast.success(`Welcome back, ${username || 'User'}!`, {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
      transition: Bounce,
    })
  }

  const errorNotify = (errorMessage) => {
    toast.error(`${errorMessage}`, {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
      transition: Bounce,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully!', {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
      transition: Bounce,
    })
    setTimeout(() => navigate('/signin'), 1000)
  }

  const handleNavItemClick = (item) => {
    setMobileSidebarOpen(false)

    if (item?.id === 'create-eventdp') {
      navigate('/create-eventdp')
      return
    }

    if (item?.id === 'dashboard') {
      navigate('/dashboard')
      return
    }

    if (item?.id === 'settings') {
      navigate('/settings')
      return
    }
  }

  const getStatusPillClass = (status) => {
    return status === 'published'
      ? 'bg-forest-green text-white'
      : 'bg-dark-slate/70 text-white'
  }

  const formatHistoryAction = (action) => {
    if (action === 'created') return 'Draft created'
    if (action === 'published') return 'Published and link generated'
    return action || 'Updated'
  }

  const getStatsCards = () => {
    const publishedCount = recentEvents.length
    const totalEvents = recentEvents.length + recentEvents.filter((e) => e.status === 'draft').length
    const activeCount = recentEvents.filter((e) => e.status === 'published').length

    return [
      {
        id: 'events',
        title: 'Total Events',
        value: totalEvents.toString(),
        helper: `${publishedCount} published`,
        icon: 'mdi:calendar-check-outline',
      },
      {
        id: 'published',
        title: 'Published Events',
        value: publishedCount.toString(),
        helper: `${activeCount} active`,
        icon: 'mdi:cloud-download-outline',
      },
      {
        id: 'member-since',
        title: 'Member Since',
        value: user.createdAt ? new Date(user.createdAt).getFullYear().toString() : 'N/A',
        helper: user.plan ? `${user.plan} Plan` : 'Pro Plan',
        icon: 'mdi:badge-outline',
      },
    ]
  }

  if (loading) {
    return (
      <div className='min-h-screen w-full bg-pale-sage flex items-center justify-center px-4'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-14 w-14 border-4 border-dusty-green/30 border-t-forest-green mx-auto'></div>
          <p className='text-dark-slate font-semibold'>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <main className='min-h-screen bg-pale-sage text-dark-slate animate-fade-in'>
      <div className='min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]'>
        <aside className='hidden lg:flex lg:sticky lg:top-0 flex-col border-r border-forest-green/20 bg-dark-slate/95 text-white p-5 animate-slide-in-left h-screen overflow-hidden'>
          <SidebarBrand dark />

          <div className='mt-8 flex-1 space-y-7 animate-fade-in-up overflow-y-auto max-h-[calc(100vh-280px)]' style={{ animationDelay: '120ms' }}>
            <NavItemsGroup items={primaryNavItems} onItemClick={handleNavItemClick} variant='dark' />
          </div>

          <div className='space-y-4 animate-fade-in-up' style={{ animationDelay: '220ms' }}>
            <NavItemsGroup items={secondaryNavItems} onItemClick={handleNavItemClick} variant='dark' />
            <SidebarProfile username={user.username || 'User'} dark />
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div className='fixed inset-0 z-40 bg-dark-slate/60 lg:hidden' onClick={() => setMobileSidebarOpen(false)}></div>
        )}

        <aside className={`fixed top-0 left-0 z-50 h-full w-[84%] max-w-[320px] bg-white border-r border-forest-green/20 p-5 lg:hidden transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='flex items-center justify-between'>
            <SidebarBrand />
            <button
              type='button'
              onClick={() => setMobileSidebarOpen(false)}
              className='h-9 w-9 rounded-lg border border-forest-green/20 hover:bg-forest-green/10 hover:rotate-90 transition duration-300'
              aria-label='Close sidebar'
            >
              <Icon icon='mdi:close' width='20' height='20' className='mx-auto' />
            </button>
          </div>

          <div className='mt-8 flex flex-col h-[calc(100%-4rem)] justify-between'>
            <NavItemsGroup items={primaryNavItems} onItemClick={handleNavItemClick} />
            <div className='space-y-4'>
              <NavItemsGroup items={secondaryNavItems} onItemClick={handleNavItemClick} />
              <SidebarProfile username={user.username || 'User'} />
            </div>
          </div>
        </aside>

        <section className='relative min-w-0 overflow-hidden animate-fade-in'>
          <div className='absolute inset-0 pointer-events-none'>
            <div className='absolute -top-24 -left-8 h-56 w-56 rounded-full bg-forest-green/20 blur-3xl animate-float'></div>
            <div className='absolute top-10 right-6 h-56 w-56 rounded-full bg-dusty-green/20 blur-3xl animate-float-delayed'></div>
          </div>

          <div className='relative p-4 sm:p-6 lg:p-8'>
            <header className='flex flex-wrap items-center justify-between gap-4 mb-7 animate-fade-in-up'>
              <button
                type='button'
                onClick={() => setMobileSidebarOpen(true)}
                className='lg:hidden h-11 w-11 rounded-xl border border-forest-green/20 bg-white/80 backdrop-blur hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300'
                aria-label='Open sidebar'
              >
                <Icon icon='mdi:menu' width='23' height='23' className='mx-auto' />
              </button>

              <div className='flex-1 min-w-60'>
                <h1 className='text-2xl sm:text-3xl font-extrabold'>Welcome back, {user.username || 'there'}!</h1>
                <p className='text-sm sm:text-base text-text-muted mt-1'>Here&apos;s what&apos;s happening with your events today.</p>
              </div>

              <div className='flex items-center gap-3 ml-auto'>
                <div className='hidden sm:flex items-center gap-2 rounded-xl border border-forest-green/20 bg-white/80 px-3 py-2 min-w-65'>
                  <Icon icon='mdi:magnify' width='18' height='18' className='text-text-muted' />
                  <input
                    type='text'
                    placeholder='Search by project title...'
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className='w-full bg-transparent text-sm placeholder:text-text-muted/80 outline-none'
                  />
                </div>

                <button type='button' className='h-11 w-11 rounded-xl border border-forest-green/20 bg-white/80 hover:bg-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300'>
                  <Icon icon='mdi:bell-outline' width='21' height='21' className='mx-auto' />
                </button>

                <button
                  onClick={handleLogout}
                  className='hidden sm:flex items-center gap-2 bg-forest-green hover:bg-[#48614F] text-white px-4 py-2.5 rounded-xl font-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg shadow-forest-green/30 hover:shadow-forest-green/40'
                >
                  <Icon icon='mdi:logout' width='18' height='18' />
                  <span>Logout</span>
                </button>
              </div>
            </header>

            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-7'>
              {getStatsCards().map((card, index) => (
                <article
                  key={card.id}
                  className='rounded-2xl border border-forest-green/15 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-forest-green/10 animate-fade-in-up hover:-translate-y-1 hover:shadow-xl hover:shadow-forest-green/15 transition-all duration-300'
                  style={{ animationDelay: `${120 + (index * 120)}ms` }}
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='text-sm text-text-muted'>{card.title}</p>
                      <p className='text-4xl font-extrabold mt-1'>{card.value}</p>
                      <p className='text-sm text-forest-green mt-2'>↗ {card.helper}</p>
                    </div>
                    <div className='h-12 w-12 rounded-xl bg-forest-green/15 text-forest-green flex items-center justify-center animate-scale-in'>
                      <Icon icon={card.icon} width='22' height='22' />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <section className='grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 mb-7'>
              <div className='rounded-2xl border border-forest-green/15 bg-white/70 p-5 animate-fade-in-up' style={{ animationDelay: '260ms' }}>
                <div className='flex items-center gap-2 mb-4'>
                  <Icon icon='mdi:lightning-bolt-outline' width='18' height='18' className='text-forest-green' />
                  <h2 className='text-2xl font-bold'>Quick Actions</h2>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <article
                    onClick={() => navigate('/create-eventdp')}
                    className='rounded-2xl border border-dashed border-forest-green/50 bg-pale-sage p-5 text-center hover:bg-white hover:-translate-y-1 transition-all duration-300 cursor-pointer'
                  >
                    <div className='h-16 w-16 mx-auto rounded-full bg-forest-green/20 flex items-center justify-center text-forest-green mb-4 animate-bounce-slow'>
                      <Icon icon='mdi:plus' width='31' height='31' />
                    </div>
                    <h3 className='text-xl font-bold'>Create New EventDP</h3>
                    <p className='text-text-muted mt-2'>Launch a new customized frame campaign for your attendees.</p>
                  </article>

                  <article className='rounded-2xl border border-forest-green/20 bg-pale-sage p-5 hover:bg-white hover:-translate-y-1 transition-all duration-300'>
                    <div className='h-10 w-10 rounded-lg bg-white text-forest-green flex items-center justify-center mb-4'>
                      <Icon icon='mdi:school-outline' width='20' height='20' />
                    </div>
                    <h3 className='text-2xl font-bold'>Learning Center</h3>
                    <p className='text-text-muted mt-2'>Learn how to maximize your event reach with our guide.</p>
                    <button type='button' className='mt-5 text-forest-green font-semibold hover:underline hover:translate-x-1 transition-transform duration-300'>
                      Read Guide →
                    </button>
                  </article>
                </div>
              </div>

              <div className='rounded-2xl border border-forest-green/15 bg-white/70 p-5 space-y-5 animate-fade-in-up' style={{ animationDelay: '360ms' }}>
                <div>
                  <p className='text-xs uppercase tracking-[0.18em] text-text-muted font-semibold'>Account Snapshot</p>
                  <p className='text-3xl font-extrabold mt-2'>Active</p>
                  <p className='text-text-muted text-sm mt-1'>All systems are healthy and running.</p>
                </div>

                <div className='space-y-3'>
                  <div className='rounded-xl bg-pale-sage p-3 border border-forest-green/15'>
                    <p className='text-xs text-text-muted uppercase'>Email</p>
                    <p className='font-semibold'>{user.email || 'N/A'}</p>
                  </div>
                  <div className='rounded-xl bg-pale-sage p-3 border border-forest-green/15'>
                    <p className='text-xs text-text-muted uppercase'>Member Since</p>
                    <p className='font-semibold'>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className='sm:hidden w-full bg-forest-green hover:bg-[#48614F] text-white px-4 py-2.5 rounded-xl font-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300'
                >
                  Logout
                </button>
              </div>
            </section>

            <section className='rounded-2xl border border-forest-green/15 bg-white/80 p-5 animate-fade-in-up' style={{ animationDelay: '460ms' }}>
              <div className='flex items-center justify-between gap-4 mb-4'>
                <div className='flex items-center gap-2'>
                  <Icon icon='mdi:history' width='18' height='18' className='text-forest-green' />
                  <h2 className='text-2xl font-bold'>Recent Events</h2>
                </div>
                <button type='button' className='text-sm font-semibold text-forest-green hover:underline'>View All</button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                {recentEvents.map((event, index) => (
                  <article
                    key={event.id}
                    className='overflow-hidden rounded-2xl border border-forest-green/15 bg-white animate-fade-in-up hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-forest-green/15'
                    style={{ animationDelay: `${560 + (index * 120)}ms` }}
                  >
                    <div className='relative h-36'>
                      <img src={event.image} alt={event.name} className='h-full w-full object-cover transition-transform duration-500 hover:scale-105' />
                      <span className={`absolute left-3 bottom-3 rounded-md px-2 py-1 text-xs font-bold ${getStatusPillClass(event.status)}`}>
                        {String(event.status || '').toUpperCase()}
                      </span>
                    </div>
                    <div className='p-4'>
                      <h3 className='text-2xl font-bold leading-tight'>{event.name}</h3>
                      <p className='text-sm text-text-muted mt-1'>Published {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</p>

                      <div className='mt-4 grid grid-cols-2 gap-4 border-t border-forest-green/15 pt-3'>
                        <div>
                          <p className='text-xs uppercase text-text-muted'>Link</p>
                          <a href={event.publicUrl} target='_blank' rel='noreferrer' className='text-sm font-extrabold text-forest-green hover:underline'>
                            Open
                          </a>
                        </div>
                        <div>
                          <p className='text-xs uppercase text-text-muted'>Slug</p>
                          <p className='text-sm font-extrabold'>{event.slug || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                {recentEvents.length === 0 && (
                  <div className='col-span-full rounded-xl border border-dashed border-forest-green/35 p-6 text-center text-sm text-text-muted'>
                    No published EventDP yet. Create one and generate your link.
                  </div>
                )}
              </div>
            </section>

            <section className='rounded-2xl border border-forest-green/15 bg-white/80 p-5 mt-5 animate-fade-in-up'>
              <div className='flex items-center gap-2 mb-4'>
                <Icon icon='mdi:timeline-text-outline' width='18' height='18' className='text-forest-green' />
                <h2 className='text-2xl font-bold'>EventDP History</h2>
              </div>

              <div className='space-y-2'>
                {eventHistory.map((item) => (
                  <div key={item.id} className='rounded-xl border border-forest-green/15 bg-white p-3 flex items-center justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-dark-slate'>{item.name}</p>
                      <p className='text-xs text-text-muted mt-0.5'>{formatHistoryAction(item.action)}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs font-semibold text-dark-slate/75'>{item.at ? new Date(item.at).toLocaleString() : 'N/A'}</p>
                      {item.publicUrl && (
                        <a href={item.publicUrl} target='_blank' rel='noreferrer' className='text-xs text-forest-green font-semibold hover:underline'>
                          Open Link
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {eventHistory.length === 0 && (
                  <div className='rounded-xl border border-dashed border-forest-green/35 p-6 text-center text-sm text-text-muted'>
                    No EventDP history yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>

      <ToastContainer position='top-center' theme='light' transition={Bounce} />
    </main>
  )
}

export default Dashboard