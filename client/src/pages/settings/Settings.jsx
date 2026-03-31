import React, { useState, useEffect } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { z } from 'zod'
import SidebarBrand from '../dashboard/components/navItems/SidebarBrand'
import SidebarProfile from '../dashboard/components/navItems/SidebarProfile'
import NavItemsGroup from '../dashboard/components/navItems/NavItemsGroup'
import { primaryNavItems, secondaryNavItems } from '../dashboard/components/navItems/navItemsConfig'

const profileSchema = z.object({
    phone: z.string().trim().max(30),
    company: z.string().trim().max(80),
    country: z.string().trim().max(60),
    bio: z.string().trim().max(300),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long').max(64),
    confirmPassword: z.string().min(8, 'Confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

const Settings = () => {
    const settingsUrl = `${import.meta.env.VITE_BASE_URL}getSettings`
    const updateSettingsUrl = `${import.meta.env.VITE_BASE_URL}updateSettings`
    const resetPasswordUrl = `${import.meta.env.VITE_BASE_URL}updatePassword`
    const deleteAccountUrl = `${import.meta.env.VITE_BASE_URL}deleteAccount`

    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(true)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [formLoading, setFormLoading] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteLoading, setDeleteLoading] = useState(false)
    const navigate = useNavigate()

    const [profileForm, setProfileForm] = useState({
        username: '',
        email: '',
        phone: '',
        company: '',
        country: '',
        bio: '',
    })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            errorNotify('No token found. Please sign in again.')
            setTimeout(() => navigate('/signin'), 1500)
            return
        }

        axios.get(settingsUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((result) => {
                if (result.status === 200) {
                    setUser(result.data.user)
                    setProfileForm({
                        username: result.data.user.username || '',
                        email: result.data.user.email || '',
                        phone: result.data.user.phone || '',
                        company: result.data.user.company || '',
                        country: result.data.user.country || '',
                        bio: result.data.user.bio || '',
                    })
                    setLoading(false)
                } else {
                    setLoading(false)
                    errorNotify(result.data?.message || 'Failed to load settings')
                }
            })
            .catch((error) => {
                setLoading(false)
                errorNotify(error?.response?.data?.message || 'Failed to fetch settings')
            })
    }, [navigate])

    const notify = (message) => {
        toast.success(message, {
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

    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfileForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setFormLoading(true)

        const parsed = profileSchema.safeParse({
            phone: profileForm.phone || '',
            company: profileForm.company || '',
            country: profileForm.country || '',
            bio: profileForm.bio || '',
        })

        if (!parsed.success) {
            errorNotify(parsed.error.issues?.[0]?.message || 'Please check your profile details')
            setFormLoading(false)
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            errorNotify('No token found. Please sign in again.')
            setFormLoading(false)
            return
        }

        try {
            const response = await axios.patch(updateSettingsUrl, profileForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.status === 200) {
                setUser(response.data.user)
                notify('Profile updated successfully!')
                setFormLoading(false)
            }
        } catch (error) {
            errorNotify(error?.response?.data?.message || 'Failed to update profile')
            setFormLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()

        const parsed = passwordSchema.safeParse(passwordForm)
        if (!parsed.success) {
            errorNotify(parsed.error.issues?.[0]?.message || 'Invalid password values')
            return
        }

        setFormLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
            errorNotify('No token found. Please sign in again.')
            setFormLoading(false)
            return
        }

        try {
            const response = await axios.patch(resetPasswordUrl, {
                currentPassword: parsed.data.currentPassword,
                newPassword: parsed.data.newPassword,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.status === 200) {
                notify('Password updated successfully!')
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                })
                setFormLoading(false)
            }
        } catch (error) {
            errorNotify(error?.response?.data?.message || 'Failed to update password')
            setFormLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('This action is permanent. Do you really want to delete your account and all EventDP projects?')
        if (!confirmed) {
            return
        }

        if (user.provider === 'manual' && (!deletePassword || deletePassword.length < 6)) {
            errorNotify('Enter your current password to delete your account')
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            errorNotify('No token found. Please sign in again.')
            return
        }

        setDeleteLoading(true)

        try {
            await axios.delete(deleteAccountUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: user.provider === 'manual' ? { currentPassword: deletePassword } : {},
            })

            localStorage.removeItem('token')
            localStorage.removeItem('user')
            notify('Account deleted successfully')
            setTimeout(() => navigate('/signup'), 1200)
        } catch (error) {
            errorNotify(error?.response?.data?.message || 'Failed to delete account')
            setDeleteLoading(false)
        }
    }

    const handleNavItemClick = (item) => {
        setMobileSidebarOpen(false)

        if (item?.id === 'create-eventdp') {
            navigate('/create-eventdp')
            return
        }

        if (item?.id === 'dashboard') {
            navigate('/dashboard')
        }

        if (item?.id === 'settings') {
            navigate('/settings')
        }
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

    if (loading) {
        return (
            <div className='min-h-screen w-full bg-pale-sage flex items-center justify-center px-4'>
                <div className='text-center space-y-4'>
                    <div className='animate-spin rounded-full h-14 w-14 border-4 border-dusty-green/30 border-t-forest-green mx-auto'></div>
                    <p className='text-dark-slate font-semibold'>Loading settings...</p>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: 'mdi:account-outline' },
        ...(user.provider === 'manual' ? [{ id: 'password', label: 'Change Password', icon: 'mdi:lock-outline' }] : []),
        { id: 'account', label: 'Account Info', icon: 'mdi:information-outline' },
    ]

    return (
        <main className='min-h-screen bg-pale-sage text-dark-slate animate-fade-in'>
            <div className='min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]'>
                <aside className='hidden lg:flex lg:sticky lg:top-0 flex-col border-r border-forest-green/20 bg-dark-slate/95 text-white p-5 animate-slide-in-left h-screen'>
                    <SidebarBrand dark />

                    <div className='mt-8 flex-1 space-y-7 animate-fade-in-up overflow-y-auto' style={{ animationDelay: '120ms' }}>
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

                <aside className={`fixed top-0 left-0 z-50 h-full w-[84%] max-w-[320px] bg-white border-r border-forest-green/20 p-5 lg:hidden transition-transform duration-300 overflow-y-auto ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
                                <h1 className='text-2xl sm:text-3xl font-extrabold'>Settings</h1>
                                <p className='text-sm sm:text-base text-text-muted mt-1'>Manage your account and preferences.</p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className='hidden sm:flex items-center gap-2 bg-forest-green hover:bg-[#48614F] text-white px-4 py-2.5 rounded-xl font-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg shadow-forest-green/30 hover:shadow-forest-green/40'
                            >
                                <Icon icon='mdi:logout' width='18' height='18' />
                                <span>Logout</span>
                            </button>
                        </header>

                        <div className='grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 auto-rows-max'>
                            <div className='flex flex-row lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0'>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap lg:w-full lg:whitespace-normal ${activeTab === tab.id
                                            ? 'bg-forest-green text-white shadow-lg shadow-forest-green/30'
                                            : 'bg-white text-dark-slate border border-forest-green/20 hover:bg-white/90'
                                            }`}
                                    >
                                        <Icon icon={tab.icon} width='18' height='18' />
                                        <span className='text-sm lg:text-base'>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div>
                                {activeTab === 'profile' && (
                                    <div className='rounded-2xl border border-forest-green/15 bg-white/80 p-6 animate-fade-in'>
                                        <h2 className='text-2xl font-bold mb-6'>Profile Settings</h2>
                                        <form onSubmit={handleUpdateProfile} className='space-y-5'>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                                <div>
                                                    <label className='block text-sm font-semibold text-dark-slate mb-2'>Username</label>
                                                    <input
                                                        type='text'
                                                        name='username'
                                                        value={profileForm.username}
                                                        onChange={handleProfileChange}
                                                        className='w-full px-4 py-2.5 rounded-lg border border-forest-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/50'
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label className='block text-sm font-semibold text-dark-slate mb-2'>Email</label>
                                                    <input
                                                        type='email'
                                                        name='email'
                                                        value={profileForm.email}
                                                        onChange={handleProfileChange}
                                                        className='w-full px-4 py-2.5 rounded-lg border border-forest-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/50'
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label className='block text-sm font-semibold text-dark-slate mb-2'>Phone</label>
                                                    <input
                                                        type='tel'
                                                        name='phone'
                                                        value={profileForm.phone}
                                                        onChange={handleProfileChange}
                                                        placeholder='+1 (555) 123-4567'
                                                        className='w-full px-4 py-2.5 rounded-lg border border-forest-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/50'
                                                    />
                                                </div>
                                                <div>
                                                    <label className='block text-sm font-semibold text-dark-slate mb-2'>Company</label>
                                                    <input
                                                        type='text'
                                                        name='company'
                                                        value={profileForm.company}
                                                        onChange={handleProfileChange}
                                                        placeholder='Your company name'
                                                        className='w-full px-4 py-2.5 rounded-lg border border-forest-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/50'
                                                    />
                                                </div>
                                                <div>
                                                    <label className='block text-sm font-semibold text-dark-slate mb-2'>Country</label>
                                                    <input
                                                        type='text'
                                                        name='country'
                                                        value={profileForm.country}
                                                        onChange={handleProfileChange}
                                                        placeholder='Your country'
                                                        className='w-full px-4 py-2.5 rounded-lg border border-forest-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/50'
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className='block text-sm font-semibold text-dark-slate mb-2'>Bio</label>
                                                <textarea
                                                    name='bio'
                                                    value={profileForm.bio}
                                                    onChange={handleProfileChange}
                                                    placeholder='Tell us about yourself...'
                                                    rows='4'
                                                    className='w-full px-4 py-2.5 rounded-lg border border-forest-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/50 resize-none'
                                                ></textarea>
                                            </div>
                                            <button
                                                type='submit'
                                                disabled={formLoading}
                                                className='w-full bg-forest-green hover:bg-[#48614F] disabled:opacity-60 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-forest-green/30'
                                            >
                                                {formLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'password' && user.provider === 'manual' && (
                                    <div className='rounded-2xl border border-forest-green/15 bg-white/80 p-6 animate-fade-in'>
                                        <h2 className='text-2xl font-bold mb-2'>Change Password</h2>
                                        <p className='text-text-muted mb-6'>Update your password to keep your account secure.</p>
                                        <form onSubmit={handleResetPassword} className='space-y-5'>
                                            <div>
                                                <label className='block text-sm font-semibold text-dark-slate mb-2'>Current Password</label>
                                                <input
                                                    type='password'
                                                    name='currentPassword'
                                                    value={passwordForm.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder='Enter your current password'
                                                    className='w-full px-4 py-2.5 rounded-lg border border-forest-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/50'
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className='block text-sm font-semibold text-dark-slate mb-2'>New Password</label>
                                                <input
                                                    type='password'
                                                    name='newPassword'
                                                    value={passwordForm.newPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder='Enter your new password'
                                                    className='w-full px-4 py-2.5 rounded-lg border border-forest-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/50'
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className='block text-sm font-semibold text-dark-slate mb-2'>Confirm Password</label>
                                                <input
                                                    type='password'
                                                    name='confirmPassword'
                                                    value={passwordForm.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder='Confirm your new password'
                                                    className='w-full px-4 py-2.5 rounded-lg border border-forest-green/20 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/50'
                                                    required
                                                />
                                            </div>
                                            <button
                                                type='submit'
                                                disabled={formLoading}
                                                className='w-full bg-forest-green hover:bg-[#48614F] disabled:opacity-60 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-forest-green/30'
                                            >
                                                {formLoading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'account' && (
                                    <div className='rounded-2xl border border-forest-green/15 bg-white/80 p-6 animate-fade-in space-y-6'>
                                        <div>
                                            <h2 className='text-2xl font-bold mb-6'>Account Information</h2>
                                        </div>

                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                            <div className='rounded-xl border border-forest-green/10 bg-pale-sage/50 p-4'>
                                                <p className='text-xs uppercase tracking-[0.18em] text-text-muted font-semibold'>Plan Type</p>
                                                <p className='text-2xl font-bold text-forest-green mt-2'>{user.plan || 'Pro'}</p>
                                            </div>
                                            <div className='rounded-xl border border-forest-green/10 bg-pale-sage/50 p-4'>
                                                <p className='text-xs uppercase tracking-[0.18em] text-text-muted font-semibold'>Login Method</p>
                                                <p className='text-2xl font-bold text-forest-green mt-2 capitalize'>{user.provider || 'Manual'}</p>
                                            </div>
                                            <div className='rounded-xl border border-forest-green/10 bg-pale-sage/50 p-4'>
                                                <p className='text-xs uppercase tracking-[0.18em] text-text-muted font-semibold'>Member Since</p>
                                                <p className='text-2xl font-bold text-forest-green mt-2'>{new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className='rounded-xl border border-forest-green/10 bg-pale-sage/50 p-4'>
                                                <p className='text-xs uppercase tracking-[0.18em] text-text-muted font-semibold'>Last Updated</p>
                                                <p className='text-2xl font-bold text-forest-green mt-2'>{new Date(user.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className='border-t border-forest-green/10 pt-6'>
                                            <h3 className='text-lg font-bold mb-3'>Danger Zone</h3>
                                            {user.provider === 'manual' && (
                                                <div className='mb-3'>
                                                    <label className='block text-sm font-semibold text-dark-slate mb-2'>Confirm Current Password</label>
                                                    <input
                                                        type='password'
                                                        value={deletePassword}
                                                        onChange={(event) => setDeletePassword(event.target.value)}
                                                        placeholder='Enter your current password'
                                                        className='w-full md:max-w-md px-4 py-2.5 rounded-lg border border-red-300/40 bg-white focus:outline-none focus:ring-2 focus:ring-red-300/40'
                                                    />
                                                </div>
                                            )}
                                            <button
                                                type='button'
                                                onClick={handleDeleteAccount}
                                                disabled={deleteLoading}
                                                className='px-4 py-2 rounded-lg border border-red-500/30 text-red-600 hover:bg-red-50 font-medium transition-all duration-300'
                                            >
                                                {deleteLoading ? 'Deleting...' : 'Delete Account'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <ToastContainer />
        </main>
    )
}

export default Settings
