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
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await axios.post(manualSignupUrl, values);
        if (result.status === 201) {
          notify();
          setTimeout(() => {
            navigate('/signin');
          }, 1000);
        }
      } catch (error) {
        console.log(error)
        errorNotify('Server error. Try agin later')
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
    <main className="min-h-screen bg-pale-sage flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-125 h-125 bg-forest-green/8 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/3 animate-float pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-100 h-100 bg-dusty-green/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 animate-float-delayed pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-40 h-40 bg-forest-green/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl shadow-forest-green/15 animate-scale-in my-8">
        {/* Left Branding Panel */}
        <div className="hidden lg:flex flex-col bg-forest-green relative overflow-hidden p-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <Link to="/" className="relative z-10 flex items-center gap-2.5 hover:opacity-80 transition-opacity animate-slide-in-left w-fit">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border border-white/20">
              E
            </div>
            <span className="font-bold text-xl text-white">EventDP</span>
          </Link>

          <div className="relative z-10 mt-auto">
            <div className="animate-fade-in-up">
              <span className="inline-block text-xs font-semibold tracking-widest text-white/60 uppercase mb-4">Get Started</span>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Create your <br />
                <span className="text-white/80">free account today</span>
              </h2>
              <p className="mt-4 text-white/65 text-base leading-relaxed">
                Join thousands of event organizers using EventDP to create stunning branded frames that attendees love to share.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                { icon: "mdi:credit-card-off-outline", text: "No credit card required" },
                { icon: "mdi:image-multiple-outline", text: "1,000+ event frame templates" },
                { icon: "mdi:share-variant-outline", text: "Share-ready in seconds" },
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
              <p className="text-white text-sm font-semibold">🚀 Join 2,000+ event organizers</p>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                Create your first branded frame in under 5 minutes. No design skills needed.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-10 animate-slide-in-right">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-6 hover:opacity-80 transition-opacity w-fit">
            <div className="w-8 h-8 rounded-lg bg-forest-green flex items-center justify-center text-white font-bold text-sm">E</div>
            <span className="font-bold text-xl text-dark-slate">EventDP</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-dark-slate">Create account</h1>
            <p className="text-text-muted mt-1.5 text-sm">Start building amazing event experiences today.</p>
          </div>

          <form className="flex flex-col gap-3.5" onSubmit={formik.handleSubmit}>
            <InputField
              type="text"
              name="username"
              placeholder="your_username"
              formik={formik}
              label="Username"
            />
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
              placeholder="Create a strong password"
              formik={formik}
              label="Password"
            />
            <InputField
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              formik={formik}
              label="Confirm password"
            />

            <button
              type="submit"
              className="w-full bg-forest-green hover:bg-[#48614F] active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-forest-green/25 hover:shadow-xl hover:shadow-forest-green/30 disabled:opacity-50 disabled:cursor-not-allowed mt-1.5 group"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <Icon icon="mdi:arrow-right" className="group-hover:translate-x-1 transition-transform" width="18" height="18" />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">or sign up with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => googleSignUpBtn()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 hover:border-dusty-green rounded-xl text-dark-slate text-sm font-medium hover:bg-pale-sage/50 active:scale-[0.97] transition-all duration-200"
            >
              <Icon icon="flat-color-icons:google" width="20" height="20" />
              Google
            </button>
            <button
              type="button"
              onClick={() => githubSignUpBtn()}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 hover:border-dark-slate rounded-xl text-dark-slate text-sm font-medium hover:bg-gray-50 active:scale-[0.97] transition-all duration-200"
            >
              <Icon icon="mdi:github" width="20" height="20" />
              GitHub
            </button>
          </div>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-forest-green font-semibold hover:underline underline-offset-2 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer position="top-center" theme="light" transition={Bounce} />
    </main>
  )
}

export default Signup;