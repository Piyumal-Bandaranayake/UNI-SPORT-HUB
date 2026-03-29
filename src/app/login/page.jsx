"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function LoginContent() {
    const [formData, setFormData] = useState({ universityId: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
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
            const result = await signIn("credentials", {
                universityId: formData.universityId,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                // Map NextAuth error codes to user-friendly messages
                const errorKey = result.error.toLowerCase();
                if (errorKey.includes("credentials") || errorKey.includes("configuration")) {
                    setError("Invalid University ID or Password");
                } else {
                    setError("Authentication failed. Please try again.");
                }
                setLoading(false);
            } else {
                // Success - redirect to dashboard
                window.location.href = "/dashboard";
            }
        } catch (error) {
            console.error("Login fetch error:", error);
            setError("Something went wrong. Please check your connection.");
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white font-sans relative overflow-hidden">
            {/* Back to Home Button */}
            <Link 
                href="/" 
                className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30 text-white rounded-full transition-all duration-300 group shadow-lg"
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-bold text-xs tracking-wide">Back to Home</span>
            </Link>

            <div className="flex w-full h-full flex-col md:flex-row">
                {/* Left Side - Branding & Illustration */}
                <div className="hidden md:flex md:w-[35%] lg:w-[30%] bg-gradient-to-br from-[#a5b4fc] to-[#818cf8] p-12 flex-col justify-between relative overflow-hidden h-full">
                    <div className="z-10 animate-fade-in-down mt-6">
                        <h1 className="text-white text-4xl font-extrabold tracking-tight drop-shadow-sm">UniSportHub</h1>
                        <p className="text-indigo-50 text-base mt-4 font-medium opacity-90 leading-relaxed max-w-xs">
                            Empowering student athletes and managing campus sports life with ease.
                        </p>
                    </div>

                    <div className="relative z-10 w-full h-[300px] flex items-center justify-center">
                        <img
                            src="/images/illustration.png"
                            alt="Student Athlete Illustration"
                            className="w-full h-full object-contain animate-float drop-shadow-2xl"
                        />
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-[60px]"></div>
                    <div className="absolute bottom-[10%] left-[-20%] w-80 h-80 bg-indigo-900 opacity-20 rounded-full blur-[80px]"></div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-[65%] lg:w-[70%] p-6 md:p-12 lg:p-16 flex flex-col justify-center bg-white h-full overflow-y-auto">
                    <div className="max-w-md mx-auto w-full space-y-6 animate-fade-in">
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign in to UniSportHub</h2>
                                <span className="text-indigo-600 font-bold text-xs cursor-pointer hover:underline transition-all hidden sm:block">ENGLISH (UK) ▼</span>
                            </div>
                            <p className="text-slate-500 font-medium text-base">Enter your details to access your account.</p>
                        </div>



                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {sessionExpired && (
                                <div className="rounded-xl bg-orange-50 p-3 border border-orange-200 animate-shake flex items-center gap-3">
                                    <span className="text-xl">⏰</span>
                                    <p className="text-xs text-orange-800 font-semibold">Session expired. Please log in again.</p>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl bg-rose-50 p-4 border border-rose-100 animate-shake flex items-center gap-4 shadow-sm shadow-rose-50/50">
                                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-xl shrink-0">⚠️</div>
                                    <div>
                                        <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest leading-none mb-1">Error</p>
                                        <p className="text-[12px] text-rose-700 font-bold leading-tight">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="relative group">
                                    <input
                                        id="universityId"
                                        name="universityId"
                                        type="text"
                                        required
                                        className="w-full border-b-2 border-slate-100 py-3 bg-transparent text-slate-900 placeholder-transparent focus:border-indigo-600 focus:outline-none transition-all duration-300 peer text-base font-medium"
                                        placeholder="University ID"
                                        value={formData.universityId}
                                        onChange={handleChange}
                                    />
                                    <label
                                        htmlFor="universityId"
                                        className="absolute left-0 -top-2.5 text-slate-400 text-xs font-bold transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-indigo-600 peer-focus:text-xs cursor-text uppercase tracking-wider"
                                    >
                                        University ID / Email
                                    </label>
                                </div>

                                <div className="relative group">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full border-b-2 border-slate-100 py-3 bg-transparent text-slate-900 placeholder-transparent focus:border-indigo-600 focus:outline-none transition-all duration-300 peer text-base font-medium pr-10"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <label
                                        htmlFor="password"
                                        className="absolute left-0 -top-2.5 text-slate-400 text-xs font-bold transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-indigo-600 peer-focus:text-xs cursor-text uppercase tracking-wider"
                                    >
                                        Password
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-3 text-slate-300 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.136 5.136m13.728 13.728L13.875 18.825M19.914 11.082C20.841 12.33 21.05 13.924 20.35 15.35M19.914 11.082a9.04 9.04 0 00-1.87-2.673l-4.168 4.168" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                    <div className="flex justify-end mt-1">
                                        <button type="button" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot password?</button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#4f46e5] text-white py-3.5 rounded-xl text-base font-black shadow-[0_15px_30px_-10px_rgba(79,70,229,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:bg-[#4338ca] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:bg-indigo-300 disabled:shadow-none disabled:translate-y-0"
                                >
                                    {loading ? "AUTHENTICATING…" : "SIGN IN"}
                                </button>

                                <p className="text-center text-sm text-slate-500 font-medium">
                                    New here?{" "}
                                    <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1">
                                        Create account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* In-page animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(1deg); }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
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
                    animation: fadeIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .animate-fade-in-down {
                    animation: fadeInDown 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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
