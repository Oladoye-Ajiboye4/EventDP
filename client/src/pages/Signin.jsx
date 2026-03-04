import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import InputField from '../components/InputField';
import { Icon } from '@iconify/react';

import axios from 'axios';
import firebaseConfig from '../firebase/config'
import { initializeApp } from "firebase/app"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"

const Signin = () => {
  const signinUrl = 'http://localhost:7890/handle-signin'
  const manualSigninUrl = 'http://localhost:7890/manual-signin'

  const navigate = useNavigate();

  // Toastify notification for successful sign in
  const notify = () => {
    toast.success('Sign in Successful!', {
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

  //Formik handles all form validations and state management
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validateOnMount: true,
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
        .required('Required'),
      password: Yup.string()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 'At least 8 chars (uppercase, lowercase, number, special char)')
        .required('Required'),
    }),
    onSubmit: values => {
      axios.post(manualSigninUrl, values)
        .then((result) => {
          if (result.status === 200) {
            notify();
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } else if (result.status === 401 || result.status === 500 || result.status === 404) {
            errorNotify(result.data.message)
          } else {
            errorNotify('Unexpected server response. Try again later')  
          }
        })
        .catch((error) => {
          console.log(error)
          errorNotify('Invalid credentials')
        })
    },
  });


  //Google signin
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  auth.useDeviceLanguage();

  const googleSignInBtn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        const userData = { ...user, ...credential, ...token }
        console.log('Success', user)

        axios.post(signinUrl, userData)
          .then((result) => {
            console.log('result', result)
            if (result.status === 201 || result.status === 200) {
              notify()
              setTimeout(() => {
                navigate('/dashboard');
              }, 1000);
            }
          })
          .catch((error) => {
            console.log(error)
            errorNotify('Server error. Try agin later')
          })
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        if (errorCode === 'auth/popup-closed-by-user') {
          errorNotify('Popup closed by user. Try again')
          return;
        } else if (errorCode === 'auth/cancelled-popup-request') {
          errorNotify('Cancelled popup request. Try again')
          return;
        } else if (errorCode === 'auth/popup-blocked') {
          errorNotify('Popup blocked by browser. Allow popups and try again')
          return;
        } else if (errorCode === 'auth/operation-not-supported-in-this-environment') {
          errorNotify('Operation not supported in this environment. Try again in a different browser')
          return;
        } else if (errorCode === 'auth/unauthorized-domain') {
          errorNotify('Unauthorized domain. Contact support')
          return;
        } else if (errorCode === 'auth/operation-not-allowed') {
          errorNotify('Operation not allowed. Contact support')
          return;
        } else if (errorCode === 'auth/invalid-credential') {
          errorNotify('Invalid credential. Try again')
          return;
        } else {
          console.log('Error logging in', error)
          errorNotify('Could\'t communicate with Google. Try again')
        }
      });

  }

  return (
    <main className='min-h-screen w-full bg-[radial-gradient(90rem_90rem_at_10%_10%,rgba(251,191,36,0.22),transparent_45%),radial-gradient(70rem_70rem_at_90%_0%,rgba(244,63,94,0.18),transparent_40%),linear-gradient(135deg,#fff7ed_0%,#fff_40%,#fef3c7_100%)] flex items-center justify-center p-4 sm:p-8'>
      <div className='w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
        <section className='hidden md:flex flex-col gap-5 p-8 rounded-3xl bg-white/70 backdrop-blur border border-amber-200 shadow-[0_20px_60px_-25px_rgba(120,53,15,0.45)]'>
          <span className='text-sm font-semibold tracking-widest text-amber-700 uppercase'>Welcome Back</span>
          <h1 className='text-4xl font-extrabold text-amber-950 leading-tight'>Sign in and continue your work.</h1>
          <p className='text-amber-900/80 text-base leading-relaxed'>Access your dashboard, sync your progress, and pick up right where you left off.</p>
          <div className='flex items-center gap-3 text-amber-900'>
            <span className='h-2 w-2 rounded-full bg-amber-600' />
            <span className='text-sm font-medium'>Fast and secure sign in</span>
          </div>
          <div className='flex items-center gap-3 text-amber-900'>
            <span className='h-2 w-2 rounded-full bg-amber-600' />
            <span className='text-sm font-medium'>Works across all your devices</span>
          </div>
        </section>

        <div className='w-full rounded-3xl bg-white/90 backdrop-blur border border-amber-100 shadow-[0_24px_70px_-35px_rgba(120,53,15,0.6)] p-6 sm:p-8'>
          <form className='flex flex-col gap-4' onSubmit={formik.handleSubmit}>
            <div className='text-center space-y-2'>
              <h1 className='text-3xl sm:text-4xl font-extrabold text-amber-950'>Sign In</h1>
              <p className='text-sm sm:text-base text-amber-900/70'>Welcome back to your focused workspace.</p>
            </div>
            <InputField type="text" name="email" placeholder="Email" formik={formik} />
            <InputField type="password" name="password" placeholder="Password" formik={formik} />

            <button
              type='submit'
              className='bg-amber-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-200/60 hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!formik.isValid}
            >
              Sign In
            </button>
          </form>

          <div className='mt-6 flex flex-col sm:flex-row gap-3 font-semibold text-base text-amber-950'>
            <Link className='flex-1 text-center bg-amber-700 text-white py-3 rounded-xl hover:bg-amber-800 transition' to='/signup'>Sign Up</Link>
            <Link className='flex-1 text-center bg-amber-100 text-amber-900 py-3 rounded-xl hover:bg-amber-200 transition' to='/'>Go Home</Link>
          </div>

          <div className='mt-6 flex flex-col gap-3'>
            <button type='button' onClick={() => googleSignInBtn()} className='flex gap-3 justify-center items-center font-semibold bg-white border border-amber-200 py-3 rounded-xl hover:bg-amber-50 transition text-amber-950'>
              <Icon icon="material-icon-theme:google" width="22" height="22" />
              <span>Continue with Google</span>
            </button>
            <button type='button' className='flex gap-3 justify-center items-center font-semibold bg-amber-950 py-3 rounded-xl hover:bg-amber-900 transition text-white'>
              <Icon icon="mdi:github" width="22" height="22" />
              <span>Continue with GitHub</span>
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" theme="light" transition={Bounce} />
    </main>
  )
}

export default Signin;