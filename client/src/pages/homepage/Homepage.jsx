import React from 'react'
import { Link } from 'react-router'

const Homepage = () => {
  return (
    <>
        <main className='flex flex-col justify-center items-center w-full h-screen gap-10'>

            <h1 className='text-4xl font-bold'>Welcome to the AuthSys</h1>
            <div className='flex gap-4'>
                <Link className='bg-amber-700/50 rounded-2xl p-5 text-white font-bold text-lg hover:bg-amber-700' to='/signup'><button>Sign Up</button></Link>
                <Link className='bg-amber-700/50 rounded-2xl p-5 text-white font-bold text-lg hover:bg-amber-700' to='/signin'><button>Sign In</button></Link>
            </div>
        </main>
    
    </>
  )
}

export default Homepage