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
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth"

const Signup = () => {
  const signupUrl = 'http://localhost:7890/handle-signup'
  const manualSignupUrl = 'http://localhost:7890/manual-signup'


  const navigate = useNavigate();

  // Toastify notification for successful sign up
  const notify = () => {
    toast.success('Sign up Successful!', {
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
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validateOnMount: true,
    validationSchema: Yup.object({
      username: Yup.string()
        .matches(/^[a-zA-Z_][a-zA-Z0-9_]{2,29}$/, 'Invalid username')
        .required('Required'),
      email: Yup.string()
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
        .required('Required'),
      password: Yup.string()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 'At least 8 chars (uppercase, lowercase, number, special char)')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: values => {
      notify();
      axios.post(manualSignupUrl, values)
        .then((result) => {
          if (result.status === 201) {
            setTimeout(() => {
              navigate('/signin');
            }, 1000);
          }
        })
        .catch((error) => {
          console.log(error)
          errorNotify('Server error. Try agin later')
        })
    },
  });


  //Google signin
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();
  auth.useDeviceLanguage();

  const googleSignUpBtn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        const userData = { username: user.displayName, email: user.email, token, provider: 'google' }

        axios.post(signupUrl, userData)
          .then((result) => {
            if (result.status === 201) {
              const token = result.data.user.token;
              if (token) {
                localStorage.setItem('token', token);
              }
              notify();
              localStorage.setItem('user', JSON.stringify(result.data.user));
              setTimeout(() => {
                navigate('/dashboard');
              }, 1000);
            }
          })
          .catch((error) => {
            errorNotify('Server error. Try again later')
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
        } else if (errorCode === 'auth/invalid-credential') {
          errorNotify('Invalid credential. Try again')
          return;
        } else if (errorCode === 'auth/account-exists-with-different-credential') {
          errorNotify('An account already exists with the same email but different sign-in credentials. Try signing in with a different method.')
          return;
        }
        else {
          console.log('Error logging in', error)
          errorNotify('Could\'t communicate with Google. Try again')
        }
      });

  }

  const githubSignUpBtn = () => {

    signInWithPopup(auth, githubProvider)
      .then((result) => {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
        const userData = { username: user.displayName, email: user.email, token, provider: 'github' }

        axios.post(signupUrl, userData)
          .then((result) => {
            if (result.status === 201) {
              const token = result.data.user.token;
              console.log('GitHub login successful, token:', token);
              if (token) {
                localStorage.setItem('token', token);
              }
              notify();
              localStorage.setItem('user', JSON.stringify(result.data.user));
              setTimeout(() => {
                navigate('/dashboard');
              }, 1000);
            }
          })
          .catch((error) => {
            console.log(error)
            errorNotify('Server error. Try again later')
          })
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GithubAuthProvider.credentialFromError(error);
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
        } else if (errorCode === 'auth/invalid-credential') {
          errorNotify('Invalid credential. Try again')
          return;
        } else if (errorCode === 'auth/account-exists-with-different-credential') {
          errorNotify('An account already exists with the same email but different sign-in credentials. Try signing in with a different method.')
          return;
        }
        else {
          console.log('Error logging in', error)
          errorNotify('Could\'t communicate with GitHub. Try again')
        }
      });
  }


  return (
    // Easil customize the Sign up page to your taste
    <main className='min-h-screen w-full bg-[radial-gradient(90rem_90rem_at_10%_10%,rgba(251,191,36,0.22),transparent_45%),radial-gradient(70rem_70rem_at_90%_0%,rgba(244,63,94,0.18),transparent_40%),linear-gradient(135deg,#fff7ed_0%,#fff_40%,#fef3c7_100%)] flex items-center justify-center p-4 sm:p-8'>
      <div className='w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
        <section className='hidden md:flex flex-col gap-5 p-8 rounded-3xl bg-white/70 backdrop-blur border border-amber-200 shadow-[0_20px_60px_-25px_rgba(120,53,15,0.45)]'>
          <span className='text-sm font-semibold tracking-widest text-amber-700 uppercase'>Welcome</span>
          <h1 className='text-4xl font-extrabold text-amber-950 leading-tight'>Create your account in minutes.</h1>
          <p className='text-amber-900/80 text-base leading-relaxed'>Join the community and keep everything synced across devices. Simple, secure, and built for focus.</p>
          <div className='flex items-center gap-3 text-amber-900'>
            <span className='h-2 w-2 rounded-full bg-amber-600' />
            <span className='text-sm font-medium'>No credit card required</span>
          </div>
          <div className='flex items-center gap-3 text-amber-900'>
            <span className='h-2 w-2 rounded-full bg-amber-600' />
            <span className='text-sm font-medium'>Free forever plan included</span>
          </div>
        </section>

        <div className='w-full rounded-3xl bg-white/90 backdrop-blur border border-amber-100 shadow-[0_24px_70px_-35px_rgba(120,53,15,0.6)] p-6 sm:p-8'>
          <form className='flex flex-col gap-4' onSubmit={formik.handleSubmit}>
            {/* Specify the input the fields  */}
            <div className='text-center space-y-2'>
              <h1 className='text-3xl sm:text-4xl font-extrabold text-amber-950'>Sign Up</h1>
              <p className='text-sm sm:text-base text-amber-900/70'>Start fresh with a clean, focused workspace.</p>
            </div>
            <InputField type="text" name="username" placeholder="Username" formik={formik} />
            <InputField type="text" name="email" placeholder="Email" formik={formik} />
            <InputField type="password" name="password" placeholder="Password" formik={formik} />
            <InputField type="password" name="confirmPassword" placeholder="Confirm Password" formik={formik} />

            <button
              type='submit'
              className='bg-amber-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-200/60 hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!formik.isValid}
            >
              Sign Up
            </button>
          </form>

          <div className='mt-6 flex flex-col sm:flex-row gap-3 font-semibold text-base text-amber-950'>
            <Link className='flex-1 text-center bg-amber-700 text-white py-3 rounded-xl hover:bg-amber-800 transition' to='/signin'>Sign In</Link>
            <Link className='flex-1 text-center bg-amber-100 text-amber-900 py-3 rounded-xl hover:bg-amber-200 transition' to='/'>Go Home</Link>
          </div>

          <div className='mt-6 flex flex-col gap-3'>
            <button type='button' onClick={() => googleSignUpBtn()} className='flex gap-3 justify-center items-center font-semibold bg-white border border-amber-200 py-3 rounded-xl hover:bg-amber-50 transition text-amber-950'>
              <Icon icon="material-icon-theme:google" width="22" height="22" />
              <span>Continue with Google</span>
            </button>
            <button onClick={() => { githubSignUpBtn() }} type='button' className='flex gap-3 justify-center items-center font-semibold bg-amber-950 py-3 rounded-xl hover:bg-amber-900 transition text-white'>
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

export default Signup;