import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import InputField from '../../../components/InputField';
import { Icon } from '@iconify/react';

import axios from 'axios';
import firebaseConfig from '../../../firebase/config'
import { initializeApp } from "firebase/app"
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth"

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
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await axios.post(manualSigninUrl, values);
        if (result.status === 200) {
          const token = result.data.user.token;
          if (token) {
            localStorage.setItem('token', token);
          }
          notify();
          localStorage.setItem('user', JSON.stringify(result.data.user));
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else if (result.status === 401 || result.status === 500 || result.status === 404) {
          errorNotify(result.data.message)
        } else {
          errorNotify('Unexpected server response. Try again later')
        }
      } catch (error) {
        console.log(error)
        errorNotify('Invalid credentials')
      } finally {
        setSubmitting(false);
      }
    },
  });


  //Google signin
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();
  auth.useDeviceLanguage();

  const googleSignInBtn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        const userData = { username: user.displayName, email: user.email, token, provider: 'github' }


        axios.post(signinUrl, userData)
          .then((result) => {
            if (result.status === 201 || result.status === 200) {
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

  const githubSignInBtn = () => {
    signInWithPopup(auth, githubProvider)
      .then((result) => {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        const userData = { username: user.displayName, email: user.email, token, provider: 'github' }


        axios.post(signinUrl, userData)
          .then((result) => {
            if (result.status === 201 || result.status === 200) {
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
          errorNotify('Couldn\'t communicate with GitHub. Try again')
        }
      });
  }

  return (
    <main className="min-h-screen bg-pale-sage flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 right-0 w-120 h-120 bg-forest-green/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 animate-float pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-95 h-95 bg-dusty-green/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 animate-float-delayed pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-50 h-50 bg-forest-green/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl shadow-forest-green/15 animate-scale-in">
        {/* Left Branding Panel */}
        <div className="hidden lg:flex flex-col bg-forest-green relative overflow-hidden p-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />
          <div className="absolute top-1/2 right-8 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

          <Link to="/" className="relative z-10 flex items-center gap-2.5 hover:opacity-80 transition-opacity animate-slide-in-left w-fit">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border border-white/20">
              E
            </div>
            <span className="font-bold text-xl text-white">EventDP</span>
          </Link>

          <div className="relative z-10 mt-auto">
            <div className="animate-fade-in-up">
              <span className="inline-block text-xs font-semibold tracking-widest text-white/60 uppercase mb-4">Welcome Back</span>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Continue creating <br />
                <span className="text-white/80">amazing events</span>
              </h2>
              <p className="mt-4 text-white/65 text-base leading-relaxed">
                Sign in to manage your event frames, track campaigns, and inspire your attendees.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                { icon: "mdi:shield-check-outline", text: "Secure encrypted authentication" },
                { icon: "mdi:devices", text: "Access from any device, anywhere" },
                { icon: "mdi:chart-line", text: "Real-time analytics & insights" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${(i + 2) * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Icon icon={item.icon} className="text-white" width="16" height="16" />
                  </div>
                  <span className="text-white/75 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <div
              className="mt-10 p-4 rounded-2xl bg-white/10 border border-white/15 animate-fade-in-up"
              style={{ animationDelay: '500ms' }}
            >
              <div className="flex -space-x-2 mb-3">
                {['photo-1494790108377-be9c29b29330', 'photo-1507003211169-0a1dd7228f2d', 'photo-1500648767791-00dcc994a43e'].map((id, i) => (
                  <img
                    key={i}
                    src={`https://images.unsplash.com/${id}?w=32&h=32&fit=crop`}
                    className="w-8 h-8 rounded-full border-2 border-forest-green object-cover"
                    alt="user"
                  />
                ))}
              </div>
              <p className="text-white text-sm font-semibold">2,000+ event organizers trust EventDP</p>
              <div className="flex mt-1 gap-0.5 items-center">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} icon="mdi:star" className="text-yellow-300" width="14" height="14" />
                ))}
                <span className="text-white/60 text-xs ml-1">5.0 rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-12 animate-slide-in-right">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 hover:opacity-80 transition-opacity w-fit">
            <div className="w-8 h-8 rounded-lg bg-forest-green flex items-center justify-center text-white font-bold text-sm">E</div>
            <span className="font-bold text-xl text-dark-slate">EventDP</span>
          </Link>

          <div className="mb-7">
            <h1 className="text-3xl font-bold text-dark-slate">Sign in</h1>
            <p className="text-text-muted mt-1.5 text-sm">Welcome back! Enter your credentials below.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
            <InputField
              type="email"
              name="email"
              placeholder="you@example.com"
              formik={formik}
              label="Email address"
            />
            <InputField
              type="password"
              name="password"
              placeholder="Enter your password"
              formik={formik}
              label="Password"
            />

            <div className="text-right -mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-forest-green hover:text-forest-green/80 font-medium transition-colors hover:underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-forest-green hover:bg-[#48614F] active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-forest-green/25 hover:shadow-xl hover:shadow-forest-green/30 disabled:opacity-50 disabled:cursor-not-allowed mt-1 group"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <Icon icon="mdi:arrow-right" className="group-hover:translate-x-1 transition-transform" width="18" height="18" />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => googleSignInBtn()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 hover:border-dusty-green rounded-xl text-dark-slate text-sm font-medium hover:bg-pale-sage/50 active:scale-[0.97] transition-all duration-200"
            >
              <Icon icon="flat-color-icons:google" width="20" height="20" />
              Google
            </button>
            <button
              type="button"
              onClick={() => githubSignInBtn()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 hover:border-dark-slate rounded-xl text-dark-slate text-sm font-medium hover:bg-gray-50 active:scale-[0.97] transition-all duration-200"
            >
              <Icon icon="mdi:github" width="20" height="20" />
              GitHub
            </button>
          </div>

          <p className="text-center text-sm text-text-muted mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-forest-green font-semibold hover:underline underline-offset-2 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer position="top-center" theme="light" transition={Bounce} />
    </main>
  )
}

export default Signin;