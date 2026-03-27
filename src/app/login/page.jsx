"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
    const [formData, setFormData] = useState({ universityId: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const sessionExpired = searchParams.get("reason") === "session_expired";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Authentication failed");
                setLoading(false);
            } else {
                // Success - redirect to dashboard
                // Since session is set, we can just push to /dashboard
                window.location.href = "/dashboard";
            }
        } catch (error) {
            console.error("Login fetch error:", error);
            setError("Something went wrong. Please check your connection.");
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-[#f0f2f5] px-4 font-sans">
            <div className="flex w-full max-w-5xl h-[650px] bg-white rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-100">
                {/* Left Side - Branding & Illustration */}
                <div className="hidden md:flex md:w-[45%] bg-[#a5b4fc] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="z-10 animate-fade-in-down">
                        <h1 className="text-white text-4xl font-bold tracking-tight">UniSportHub</h1>
                        <p className="text-indigo-50 text-lg mt-4 font-medium opacity-90 leading-relaxed">
                            Empowering student athletes and managing campus sports life with ease.
                        </p>
                    </div>

                    <div className="relative z-10 w-full h-[350px] mt-8 flex items-center justify-center">
                        <img
                            src="/images/illustration.png"
                            alt="Student Athlete Illustration"
                            className="w-full h-full object-contain animate-float"
                        />
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-900 opacity-10 rounded-full blur-3xl"></div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-[55%] p-8 md:p-14 flex flex-col justify-center overflow-y-auto bg-white">
                    <div className="max-w-md mx-auto w-full space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <h2 className="text-2xl font-bold text-slate-800">Sign in to UniSportHub</h2>
                            <span className="text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors hidden sm:block">ENGLISH (UK) ▼</span>
                        </div>

                        {/* Social Logins */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <button className="flex-1 flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 group active:scale-95">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                                    <path fill="#34A853" d="M16.04 18.013c-1.09.593-2.425.987-4.04.987-2.068 0-3.863-1.11-4.734-2.731l-4.026 3.115C5.198 23.302 8.355 25 12 25c3.055 0 5.79-.855 7.91-2.31l-3.87-4.677Z" />
                                    <path fill="#4A90E2" d="M19.91 22.69c2.518-1.72 4.09-4.327 4.09-8.69 0-.818-.11-1.618-.3-2.382H12v4.8h6.736c-.29 1.514-1.145 2.795-2.3 3.595l3.473 5.677Z" />
                                    <path fill="#FBBC05" d="M5.266 14.235 1.24 17.35c-.79-1.6-1.24-3.39-1.24-5.35s.45-3.75 1.24-5.35L5.266 9.765c-.173.71-.266 1.455-.266 2.235s.093 1.525.266 2.235Z" />
                                </svg>
                                <span className="text-slate-600 text-sm font-semibold">Sign in with Google</span>
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 group active:scale-95">
                                <svg className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="text-slate-600 text-sm font-semibold">Sign in with Facebook</span>
                            </button>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            {sessionExpired && (
                                <div className="rounded-xl bg-orange-50 p-4 border border-orange-200 animate-shake">
                                    <p className="text-sm text-orange-800 font-medium">
                                        ⏰ Session expired. Please log in again.
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 animate-shake">
                                    <p className="text-sm text-rose-700 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="relative group">
                                    <input
                                        id="universityId"
                                        name="universityId"
                                        type="text"
                                        required
                                        className="w-full border-b-2 border-slate-200 py-3 bg-transparent text-slate-900 placeholder-transparent focus:border-indigo-600 focus:outline-none transition-all duration-300 peer text-[15px]"
                                        placeholder="University ID"
                                        value={formData.universityId}
                                        onChange={handleChange}
                                    />
                                    <label
                                        htmlFor="universityId"
                                        className="absolute left-0 -top-3.5 text-slate-500 text-sm transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-indigo-600 peer-focus:text-sm cursor-text"
                                    >
                                        University ID or Email Address
                                    </label>
                                </div>

                                <div className="relative group">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full border-b-2 border-slate-200 py-3 bg-transparent text-slate-900 placeholder-transparent focus:border-indigo-600 focus:outline-none transition-all duration-300 peer text-[15px]"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <label
                                        htmlFor="password"
                                        className="absolute left-0 -top-3.5 text-slate-500 text-sm transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-indigo-600 peer-focus:text-sm cursor-text"
                                    >
                                        Password
                                    </label>
                                    <div className="absolute right-0 top-3 text-slate-400 cursor-pointer hover:text-indigo-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#4f46e5] text-white py-4 rounded-xl text-sm font-bold shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(79,70,229,0.6)] hover:bg-[#4338ca] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:bg-indigo-300 disabled:shadow-none disabled:translate-y-0"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Authenticating…
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </button>

                            <p className="text-center text-sm text-slate-500 font-medium">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 border-b-2 border-transparent hover:border-indigo-600 transition-all">
                                    Register here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {/* In-page animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-fade-in-down {
                    animation: fadeInDown 0.8s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#f0f2f5]">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
