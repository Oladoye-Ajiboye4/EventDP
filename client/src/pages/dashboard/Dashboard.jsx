import React, { useState, useEffect } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Icon } from '@iconify/react';

const Dashboard = () => {
  const dashboardUrl = 'http://localhost:7890/getDashboard'
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      errorNotify('No token found. Please sign in again.');
      setTimeout(() => navigate('/signin'), 1500);
      return;
    }

    axios.get(dashboardUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((result) => {
        if (result.status === 200) {
          setUser(result.data.user);
          setLoading(false);
          notify();

        } else if (result.status === 401 || result.status === 500 || result.status === 404) {
          setLoading(false);
          errorNotify(result.data.message)
        } else {
          setLoading(false);
          errorNotify('Unexpected server response. Try again later')
        }
      })
      .catch((error) => {
        console.log(error)
        setLoading(false);
        errorNotify(error?.response?.data?.message || 'Failed to fetch dashboard data')
      })

  }, [navigate])

  // Toastify notification for successful sign in
  const notify = () => {
    toast.success(`Welcome ${user.username || 'User'}!`, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });
  };

  // Toastify notification for error 
  const errorNotify = (errorMessage) => {
    toast.error(`${errorMessage}`, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });
    setTimeout(() => navigate('/signin'), 1000);
  };

  if (loading) {
    return (
      <div className='min-h-screen w-full bg-[radial-gradient(90rem_90rem_at_10%_10%,rgba(251,191,36,0.22),transparent_45%),radial-gradient(70rem_70rem_at_90%_0%,rgba(244,63,94,0.18),transparent_40%),linear-gradient(135deg,#fff7ed_0%,#fff_40%,#fef3c7_100%)] flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-700 mx-auto'></div>
          <p className='text-amber-900 font-semibold'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className='min-h-screen w-full bg-[radial-gradient(90rem_90rem_at_10%_10%,rgba(251,191,36,0.22),transparent_45%),radial-gradient(70rem_70rem_at_90%_0%,rgba(244,63,94,0.18),transparent_40%),linear-gradient(135deg,#fff7ed_0%,#fff_40%,#fef3c7_100%)] p-4 sm:p-8'>
      <div className='w-full max-w-6xl mx-auto'>

        {/* Header Section */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <div>
            <h1 className='text-3xl sm:text-4xl font-extrabold text-amber-950'>Dashboard</h1>
            <p className='text-amber-900/70 text-base sm:text-lg mt-1'>Manage and view your account details</p>
          </div>
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 bg-amber-700 text-white px-4 py-3 rounded-xl font-semibold hover:bg-amber-800 transition shadow-lg shadow-amber-200/60'
          >
            <Icon icon="mdi:logout" width="20" height="20" />
            <span>Logout</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='md:col-span-2 rounded-3xl bg-white/90 backdrop-blur border border-amber-100 shadow-[0_24px_70px_-35px_rgba(120,53,15,0.6)] p-6 sm:p-8'>
            <div className='flex flex-col sm:flex-row gap-6 items-start sm:items-center'>
              <div className='w-20 h-20 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0'>
                <Icon icon="mdi:account" width="48" height="48" className='text-white' />
              </div>
              <div className='flex-1'>
                <h2 className='text-2xl sm:text-3xl font-extrabold text-amber-950 mb-1'>{user.username || 'User'}</h2>
                <p className='text-amber-900/70 text-base mb-3'>{user.email}</p>
                <div className='flex flex-wrap gap-2'>
                  <span className='inline-block bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-sm font-medium'>Account Active</span>
                  <span className='inline-block bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-sm font-medium'>Member</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className='rounded-3xl bg-white/90 backdrop-blur border border-amber-100 shadow-[0_24px_70px_-35px_rgba(120,53,15,0.6)] p-6 sm:p-8 flex flex-col justify-between'>
            <div>
              <p className='text-amber-900/70 text-sm font-semibold uppercase tracking-wide'>Account Status</p>
              <p className='text-2xl sm:text-3xl font-extrabold text-amber-950 mt-2'>Active</p>
            </div>
            <div className='w-full h-2 bg-amber-100 rounded-full overflow-hidden mt-4'>
              <div className='h-full w-full bg-linear-to-r from-amber-500 to-amber-700' />
            </div>
            <p className='text-amber-900/70 text-xs mt-3'>Full access to all features</p>
          </div>
        </div>

        {/* Account Details Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>

          {/* Personal Information */}
          <div className='rounded-3xl bg-white/90 backdrop-blur border border-amber-100 shadow-[0_24px_70px_-35px_rgba(120,53,15,0.6)] p-6 sm:p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-3 bg-amber-100 rounded-xl'>
                <Icon icon="mdi:information-outline" width="24" height="24" className='text-amber-700' />
              </div>
              <h3 className='text-xl font-extrabold text-amber-950'>Personal Information</h3>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-xs font-semibold uppercase tracking-wide text-amber-700'>Username</label>
                <p className='text-lg font-semibold text-amber-950 mt-1'>{user.username || 'N/A'}</p>
              </div>
              <div className='border-t border-amber-100 pt-4'>
                <label className='text-xs font-semibold uppercase tracking-wide text-amber-700'>Email Address</label>
                <p className='text-lg font-semibold text-amber-950 mt-1'>{user.email || 'N/A'}</p>
              </div>
              <div className='border-t border-amber-100 pt-4'>
                <label className='text-xs font-semibold uppercase tracking-wide text-amber-700'>Account Created</label>
                <p className='text-lg font-semibold text-amber-950 mt-1'>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className='rounded-3xl bg-white/90 backdrop-blur border border-amber-100 shadow-[0_24px_70px_-35px_rgba(120,53,15,0.6)] p-6 sm:p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-3 bg-amber-100 rounded-xl'>
                <Icon icon="mdi:cog-outline" width="24" height="24" className='text-amber-700' />
              </div>
              <h3 className='text-xl font-extrabold text-amber-950'>Quick Actions</h3>
            </div>

            <div className='space-y-3'>
              <button className='w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition border border-amber-200 group'>
                <div className='flex items-center gap-3'>
                  <Icon icon="mdi:lock-outline" width="20" height="20" className='text-amber-700 group-hover:text-amber-900' />
                  <span className='font-semibold text-amber-950'>Change Password</span>
                </div>
                <Icon icon="mdi:chevron-right" width="20" height="20" className='text-amber-700' />
              </button>

              <button className='w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition border border-amber-200 group'>
                <div className='flex items-center gap-3'>
                  <Icon icon="mdi:bell-outline" width="20" height="20" className='text-amber-700 group-hover:text-amber-900' />
                  <span className='font-semibold text-amber-950'>Notifications</span>
                </div>
                <Icon icon="mdi:chevron-right" width="20" height="20" className='text-amber-700' />
              </button>

              <button className='w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition border border-amber-200 group'>
                <div className='flex items-center gap-3'>
                  <Icon icon="mdi:shield-outline" width="20" height="20" className='text-amber-700 group-hover:text-amber-900' />
                  <span className='font-semibold text-amber-950'>Privacy Settings</span>
                </div>
                <Icon icon="mdi:chevron-right" width="20" height="20" className='text-amber-700' />
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className='rounded-3xl bg-white/90 backdrop-blur border border-amber-100 shadow-[0_24px_70px_-35px_rgba(120,53,15,0.6)] p-6 sm:p-8 mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-3 bg-amber-100 rounded-xl'>
              <Icon icon="mdi:file-document-outline" width="24" height="24" className='text-amber-700' />
            </div>
            <h3 className='text-xl font-extrabold text-amber-950'>Account Summary</h3>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='p-4 bg-amber-50 rounded-xl border border-amber-200'>
              <p className='text-amber-900/70 text-sm font-semibold'>Status</p>
              <p className='text-2xl font-extrabold text-amber-950 mt-2'>Active</p>
              <p className='text-amber-900/60 text-xs mt-1'>Your account is in good standing</p>
            </div>

            <div className='p-4 bg-amber-50 rounded-xl border border-amber-200'>
              <p className='text-amber-900/70 text-sm font-semibold'>Last Login</p>
              <p className='text-2xl font-extrabold text-amber-950 mt-2'>Today</p>
              <p className='text-amber-900/60 text-xs mt-1'>Just now</p>
            </div>

            <div className='p-4 bg-amber-50 rounded-xl border border-amber-200'>
              <p className='text-amber-900/70 text-sm font-semibold'>Security</p>
              <p className='text-2xl font-extrabold text-amber-950 mt-2'>Secure</p>
              <p className='text-amber-900/60 text-xs mt-1'>All systems operational</p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className='text-center space-y-3'>
          <p className='text-amber-900/70 text-sm'>Need help? <a href="#" className='font-semibold text-amber-700 hover:text-amber-800 transition'>Contact support</a></p>
          <p className='text-amber-900/50 text-xs'>© 2026 Your Platform. All rights reserved.</p>
        </div>
      </div>

      <ToastContainer position="top-center" theme="light" transition={Bounce} />
    </main>
  )
}

export default Dashboard