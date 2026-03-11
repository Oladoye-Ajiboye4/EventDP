import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import InputField from '../../../components/InputField';
import { Icon } from '@iconify/react';
import axios from 'axios';

const ResetPassword = () => {
    const resetPasswordUrl = 'http://localhost:7890/reset-password';
    const [searchParams] = useSearchParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        // Check if token exists in URL
        if (!token) {
            setTokenValid(false);
            errorNotify('Invalid or missing reset token');
        }
    }, [token]);

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
            password: '',
            confirmPassword: '',
        },
        validateOnMount: true,
        validationSchema: Yup.object({
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 'At least 8 chars (uppercase, lowercase, number, special char)')
                .required('Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const result = await axios.post(resetPasswordUrl, { token, password: values.password });
                if (result.status === 200) {
                    notify('Password reset successful!');
                    setIsSubmitted(true);
                    setTimeout(() => {
                        navigate('/signin');
                    }, 3000);
                } else {
                    errorNotify('Something went wrong. Try again later');
                }
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    errorNotify('Invalid or expired token. Request a new reset link');
                    setTokenValid(false);
                } else if (error.response && error.response.data && error.response.data.message) {
                    errorNotify(error.response.data.message);
                } else {
                    errorNotify('Unable to reset password. Try again later');
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
                            <span className="inline-block text-xs font-semibold tracking-widest text-white/60 uppercase mb-4">New Password</span>
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Set a strong <br />
                                <span className="text-white/80">new password</span>
                            </h2>
                            <p className="mt-4 text-white/65 text-base leading-relaxed">
                                Create a strong, unique password to keep your EventDP account secure.
                            </p>
                        </div>

                        <div className="mt-8 space-y-4">
                            {[
                                { icon: "mdi:shield-lock-outline", text: "At least 8 characters long" },
                                { icon: "mdi:format-letter-case", text: "Mix uppercase & lowercase letters" },
                                { icon: "mdi:asterisk", text: "Include numbers & special characters" },
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

                    {!isSubmitted && tokenValid ? (
                        <>
                            <div className="mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-forest-green/10 flex items-center justify-center mb-6">
                                    <Icon icon="mdi:lock-reset" className="text-forest-green" width="28" height="28" />
                                </div>
                                <h1 className="text-3xl font-bold text-dark-slate">Reset password</h1>
                                <p className="text-text-muted mt-1.5 text-sm">Enter your new password below.</p>
                            </div>

                            <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
                                <InputField
                                    type="password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    formik={formik}
                                    label="New password"
                                />
                                <InputField
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your new password"
                                    formik={formik}
                                    label="Confirm password"
                                />

                                <button
                                    type="submit"
                                    className="w-full bg-forest-green hover:bg-[#48614F] active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-forest-green/25 hover:shadow-forest-green/30 disabled:opacity-50 disabled:cursor-not-allowed mt-1 group"
                                    disabled={!formik.isValid || formik.isSubmitting}
                                >
                                    {formik.isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Resetting...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Reset Password
                                            <Icon icon="mdi:check" className="group-hover:scale-110 transition-transform" width="18" height="18" />
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
                    ) : isSubmitted ? (
                        <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
                            <div className="w-16 h-16 rounded-full bg-forest-green/10 flex items-center justify-center animate-scale-in">
                                <Icon icon="mdi:check-circle-outline" className="text-forest-green" width="32" height="32" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-dark-slate">Password reset!</h2>
                                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                                    Your password has been changed successfully. You can now sign in with your new password.
                                </p>
                            </div>
                            <Link
                                to="/signin"
                                className="w-full bg-forest-green hover:bg-[#48614F] text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-forest-green/25 text-center text-sm"
                            >
                                Sign In Now →
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center animate-scale-in">
                                <Icon icon="mdi:alert-circle-outline" className="text-red-500" width="32" height="32" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-dark-slate">Invalid or expired link</h2>
                                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                                    This password reset link is invalid or has expired. Please request a new one.
                                </p>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="w-full bg-forest-green hover:bg-[#48614F] text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-forest-green/25 text-center text-sm"
                            >
                                Request New Link
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <ToastContainer position="top-center" theme="light" transition={Bounce} />
        </main>
    );
};

export default ResetPassword;
