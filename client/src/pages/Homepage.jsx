import React from 'react'
import { Link } from 'react-router'

const Homepage = () => {
  return (
    <>
        <main className='flex flex-col justify-center items-center w-full h-screen'>

            <h1 className='text-2xl'>Welcome to the AuthSys</h1>
            <div>
                <Link to='/signup'><button>Sign Up</button></Link>
                <Link to='/signin'><button>Sign In</button></Link>

            </div>
        </main>
    
    </>
  )
}

export default Homepage