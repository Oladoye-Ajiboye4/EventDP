import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import InputField from '../../../components/InputField';
import { Icon } from '@iconify/react';
import axios from 'axios';

const ForgotPassword = () => {
    const forgotPasswordUrl = 'http://localhost:7890/forgot-password';
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    // Toastify notification for success
    const notify = (message) => {
        toast.success(message, {
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

    // Formik handles all form validations and state management
    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validateOnMount: true,
        validationSchema: Yup.object({
            email: Yup.string()
                .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
                .required('Required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const result = await axios.post(forgotPasswordUrl, values);
                if (result.status === 200) {
                    notify('Password reset link sent to your email!');
                    setIsSubmitted(true);
                    setTimeout(() => {
                        navigate('/signin');
                    }, 3000);
                } else {
                    errorNotify('Something went wrong. Try again later');
                }
            } catch (error) {
                console.log(error);
                if (error.response && error.response.status === 404) {
                    errorNotify('Email not found in our system');
                } else if (error.response && error.response.data && error.response.data.message) {
                    errorNotify(error.response.data.message);
                } else {
                    errorNotify('Unable to process request. Try again later');
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <main className="min-h-screen bg-pale-sage flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute top-0 right-0 w-112.5 h-112.5 bg-forest-green/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 animate-float pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-95 h-95 bg-dusty-green/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 animate-float-delayed pointer-events-none" />

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl shadow-forest-green/15 animate-scale-in">
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
                            <span className="inline-block text-xs font-semibold tracking-widest text-white/60 uppercase mb-4">Account Recovery</span>
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Forgot your <br />
                                <span className="text-white/80">password?</span>
                            </h2>
                            <p className="mt-4 text-white/65 text-base leading-relaxed">
                                No worries! Enter your email and we'll send you a secure link to reset your password instantly.
                            </p>
                        </div>

                        <div className="mt-8 space-y-4">
                            {[
                                { icon: "mdi:email-fast-outline", text: "Reset link sent instantly" },
                                { icon: "mdi:clock-outline", text: "Link expires in 1 hour" },
                                { icon: "mdi:shield-lock-outline", text: "Secure & encrypted process" },
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
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="flex flex-col justify-center bg-white p-8 sm:p-12 animate-slide-in-right min-h-130">
                    <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 hover:opacity-80 transition-opacity w-fit">
                        <div className="w-8 h-8 rounded-lg bg-forest-green flex items-center justify-center text-white font-bold text-sm">E</div>
                        <span className="font-bold text-xl text-dark-slate">EventDP</span>
                    </Link>

                    {!isSubmitted ? (
                        <>
                            <div className="mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-forest-green/10 flex items-center justify-center mb-6">
                                    <Icon icon="mdi:lock-question" className="text-forest-green" width="28" height="28" />
                                </div>
                                <h1 className="text-3xl font-bold text-dark-slate">Forgot password?</h1>
                                <p className="text-text-muted mt-1.5 text-sm">Enter your email to receive a reset link.</p>
                            </div>

                            <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
                                <InputField
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    formik={formik}
                                    label="Email address"
                                />

                                <button
                                    type="submit"
                                    className="w-full bg-forest-green hover:bg-[#48614F] active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-forest-green/25 hover:shadow-forest-green/30 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    disabled={!formik.isValid || formik.isSubmitting}
                                >
                                    {formik.isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Sending link...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Send Reset Link
                                            <Icon icon="mdi:send-outline" className="group-hover:translate-x-1 transition-transform" width="18" height="18" />
                                        </span>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <Link
                                    to="/signin"
                                    className="flex-1 text-center py-2.5 px-4 border border-gray-200 hover:border-forest-green rounded-xl text-dark-slate text-sm font-medium hover:bg-pale-sage/40 active:scale-[0.97] transition-all duration-200"
                                >
                                    ← Back to Sign In
                                </Link>
                                <Link
                                    to="/"
                                    className="flex-1 text-center py-2.5 px-4 border border-gray-200 hover:border-gray-300 rounded-xl text-dark-slate text-sm font-medium hover:bg-gray-50 active:scale-[0.97] transition-all duration-200"
                                >
                                    Go Home
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
                            <div className="w-16 h-16 rounded-full bg-forest-green/10 flex items-center justify-center animate-scale-in">
                                <Icon icon="mdi:email-check-outline" className="text-forest-green" width="32" height="32" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-dark-slate">Check your email!</h2>
                                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                                    We've sent a reset link to{' '}
                                    <span className="font-semibold text-dark-slate">{formik.values.email}</span>
                                </p>
                                <p className="text-text-muted mt-2 text-xs">
                                    Didn't receive it? Check your spam folder or try again.
                                </p>
                            </div>
                            <Link
                                to="/signin"
                                className="w-full bg-forest-green hover:bg-[#48614F] text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-forest-green/25 text-center text-sm"
                            >
                                Back to Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <ToastContainer position="top-center" theme="light" transition={Bounce} />
        </main>
    );
};

export default ForgotPassword;
