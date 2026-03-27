"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        universityId: "",
        universityEmail: "",
        faculty: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [idError, setIdError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const validateId = (id, faculty) => {
        if (!faculty || !id) return "";
        const pattern = new RegExp(`^${faculty}\\d{8}$`);
        if (!pattern.test(id)) {
            return `Registration number must start with "${faculty}" followed by exactly 8 digits (e.g. ${faculty}12345678)`;
        }
        return "";
    };

    const validateEmail = (email, universityId) => {
        if (!email || !universityId) return "";
        const expected = `${universityId}@my.sliit.lk`;
        if (email !== expected) {
            return `University email must be "${expected}"`;
        }
        return "";
    };

    const validatePassword = (password) => {
        const requirements = [
            { id: 0, label: "Minimum 8 characters", test: (pw) => pw.length >= 8 },
            { id: 1, label: "Uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
            { id: 2, label: "Lowercase letter", test: (pw) => /[a-z]/.test(pw) },
            { id: 3, label: "A number", test: (pw) => /\d/.test(pw) },
            { id: 4, label: "A special character (@$!%*?&)", test: (pw) => /[@$!%*?&]/.test(pw) },
        ];
        
        const failedCount = requirements.filter(req => !req.test(password)).length;
        if (failedCount > 0 && password.length > 0) {
            return "Please fulfill all security requirements.";
        }
        return "";
    };

    const handleChange = (e) => {
        const updated = { ...formData, [e.target.name]: e.target.value };
        setFormData(updated);

        // Re-validate Registration Number whenever universityId or faculty changes
        if (e.target.name === "universityId" || e.target.name === "faculty") {
            const idToCheck = e.target.name === "universityId" ? e.target.value : formData.universityId;
            const facToCheck = e.target.name === "faculty" ? e.target.value : formData.faculty;
            setIdError(validateId(idToCheck, facToCheck));
            // Also re-validate email when universityId changes
            if (e.target.name === "universityId") {
                setEmailError(validateEmail(formData.universityEmail, e.target.value));
            }
        }

        // Re-validate email whenever universityEmail or universityId changes
        if (e.target.name === "universityEmail") {
            setEmailError(validateEmail(e.target.value, formData.universityId));
        }

        // Re-validate password strength
        if (e.target.name === "password") {
            setPasswordError(validatePassword(e.target.value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Block submission if ID doesn't match faculty
        const idValidationError = validateId(formData.universityId, formData.faculty);
        if (idValidationError) {
            setIdError(idValidationError);
            return;
        }

        // Block submission if email doesn't match registration number
        const emailValidationError = validateEmail(formData.universityEmail, formData.universityId);
        if (emailValidationError) {
            setEmailError(emailValidationError);
            return;
        }

        // Block submission if password is weak
        const passwordValidationError = validatePassword(formData.password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Registration failed");
                setLoading(false);
            } else {
                setSuccess("Account created successfully! Redirecting to login...");
                setLoading(false);
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setError("Something went wrong. Please check your connection.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4 py-8 font-sans">
            <div className="flex w-full max-w-[950px] h-[680px] bg-white rounded-[60px] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-100">
                {/* Left Side - Branding & Illustration */}
                <div className="hidden lg:flex lg:w-[40%] bg-[#a5b4fc] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="z-10 animate-fade-in-down">
                        <Link href="/login" className="inline-flex items-center text-white font-bold opacity-80 hover:opacity-100 transition-opacity mb-8">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Login
                        </Link>
                        <h1 className="text-white text-5xl font-black tracking-tighter">Join Us</h1>
                        <p className="text-indigo-50 text-xl mt-6 font-medium opacity-90 leading-relaxed">
                            Start your journey with UniSportHub and unlock your athletic potential at SLIIT.
                        </p>
                    </div>

                    <div className="relative z-10 w-full h-[400px] flex items-center justify-center">
                        <img
                            src="/images/illustration.png"
                            alt="Student Athlete Illustration"
                            className="w-full h-full object-contain animate-float"
                        />
                    </div>

                    <div className="z-10 text-indigo-100 text-sm font-semibold opacity-60">
                        © 2024 UniSportHub. SLIIT Campus Sports.
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-indigo-900 opacity-20 rounded-full blur-3xl"></div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-[60%] p-8 lg:p-14 flex flex-col justify-center overflow-y-auto bg-white custom-scrollbar">
                    <div className="max-w-md mx-auto w-full space-y-6 py-6 transition-all duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
                            <span className="text-slate-400 text-sm font-bold cursor-pointer hover:text-indigo-600 transition-colors hidden sm:block">SIGN UP</span>
                        </div>

                        {error && (
                            <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100 animate-shake flex items-center gap-3">
                                <div className="bg-rose-500 rounded-full p-1 text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <p className="text-sm text-rose-700 font-bold">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 animate-fade-in flex items-center gap-3">
                                <div className="bg-emerald-500 rounded-full p-1 text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-sm text-emerald-700 font-bold">{success}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Grid layout for Compact fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full border-b-2 border-slate-200 py-3 bg-transparent text-slate-900 placeholder-transparent focus:border-indigo-600 focus:outline-none transition-all duration-300 peer text-[15px]"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="name" className="absolute left-0 -top-3.5 text-slate-500 text-xs transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-indigo-600 peer-focus:text-xs">Full Name</label>
                                </div>

                                <div className="relative group">
                                    <select
                                        id="faculty"
                                        name="faculty"
                                        required
                                        className="w-full border-b-2 border-slate-200 py-3 bg-transparent text-slate-800 focus:border-indigo-600 focus:outline-none transition-all duration-300 text-[15px] appearance-none"
                                        value={formData.faculty}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Select Faculty</option>
                                        <option value="IT">IT – Computing</option>
                                        <option value="BM">BM – Business</option>
                                        <option value="ENG">ENG – Engineering</option>
                                        <option value="HM">HM – Hospitality</option>
                                        <option value="AR">AR – Agriculture</option>
                                        <option value="HU">HU – Humanities</option>
                                        <option value="FA">FA – Fine Arts</option>
                                    </select>
                                    <div className="absolute right-0 top-4 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                    <label htmlFor="faculty" className="absolute left-0 -top-3.5 text-indigo-600 text-xs font-bold">Faculty</label>
                                </div>
                            </div>

                            <div className="relative group">
                                <input
                                    id="universityId"
                                    name="universityId"
                                    type="text"
                                    required
                                    className={`w-full border-b-2 py-3 bg-transparent text-slate-900 placeholder-transparent focus:outline-none transition-all duration-300 peer text-[15px] ${idError ? "border-rose-400 focus:border-rose-600" : "border-slate-200 focus:border-indigo-600"}`}
                                    placeholder="Registration Number"
                                    value={formData.universityId}
                                    onChange={handleChange}
                                />
                                <label htmlFor="universityId" className={`absolute left-0 -top-3.5 text-xs transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs ${idError ? "text-rose-500 peer-focus:text-rose-600" : "text-slate-500 peer-focus:text-indigo-600"}`}>Registration Number</label>
                                {idError ? (
                                    <p className="absolute -bottom-5 left-0 text-[10px] text-rose-600 font-bold">{idError}</p>
                                ) : formData.universityId && formData.faculty && (
                                    <p className="absolute -bottom-5 left-0 text-[10px] text-emerald-600 font-bold">✓ Valid SLIIT ID</p>
                                )}
                            </div>

                            <div className="relative group pt-2">
                                <input
                                    id="universityEmail"
                                    name="universityEmail"
                                    type="email"
                                    required
                                    className={`w-full border-b-2 py-3 bg-transparent text-slate-900 placeholder-transparent focus:outline-none transition-all duration-300 peer text-[15px] ${emailError ? "border-rose-400 focus:border-rose-600" : "border-slate-200 focus:border-indigo-600"}`}
                                    placeholder="University Email"
                                    value={formData.universityEmail}
                                    onChange={handleChange}
                                />
                                <label htmlFor="universityEmail" className={`absolute left-0 -top-1.5 text-xs transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-5 peer-focus:-top-1.5 peer-focus:text-xs ${emailError ? "text-rose-500 peer-focus:text-rose-600" : "text-slate-500 peer-focus:text-indigo-600"}`}>University Email</label>
                                {emailError ? (
                                    <p className="absolute -bottom-5 left-0 text-[10px] text-rose-600 font-bold">{emailError}</p>
                                ) : formData.universityEmail && formData.universityId && (
                                    <p className="absolute -bottom-5 left-0 text-[10px] text-emerald-600 font-bold">✓ University email is valid</p>
                                )}
                            </div>

                            <div className="space-y-8 pt-2">
                                <div className="relative group">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className={`w-full border-b-2 py-3 bg-transparent text-slate-900 placeholder-transparent focus:outline-none transition-all duration-300 peer text-[15px] ${passwordError && formData.password ? "border-rose-400 focus:border-rose-600" : "border-slate-200 focus:border-indigo-600"}`}
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="password" title="Show password" className="absolute left-0 -top-3.5 text-slate-500 text-xs transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-indigo-600 peer-focus:text-xs">Secure Password</label>
                                    
                                    {/* Real-time Checklist */}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {[
                                            { label: "8+ chars", test: (pw) => pw.length >= 8 },
                                            { label: "Upper/Lower", test: (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw) },
                                            { label: "Number", test: (pw) => /\d/.test(pw) },
                                            { label: "Symbol", test: (pw) => /[@$!%*?&]/.test(pw) },
                                        ].map((req, i) => {
                                            const isDone = req.test(formData.password);
                                            return (
                                                <div key={i} className={`flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all ${isDone ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                                                    {isDone && <span className="mr-1">✓</span>}
                                                    {req.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="relative group">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className={`w-full border-b-2 py-3 bg-transparent text-slate-900 placeholder-transparent focus:outline-none transition-all duration-300 peer text-[15px] ${formData.confirmPassword && formData.confirmPassword !== formData.password ? "border-rose-400 focus:border-rose-600" : "border-slate-200 focus:border-indigo-600"}`}
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="confirmPassword" className="absolute left-0 -top-3.5 text-slate-500 text-xs transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-indigo-600 peer-focus:text-xs">Confirm Password</label>
                                    {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                                        <p className="absolute -bottom-5 left-0 text-[10px] text-rose-600 font-bold">Passwords do not match</p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#4f46e5] text-white py-4 rounded-2xl text-sm font-black tracking-widest uppercase shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(79,70,229,0.6)] hover:bg-[#4338ca] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:bg-indigo-300 disabled:shadow-none"
                            >
                                {loading ? "Creating Account..." : "Register Now"}
                            </button>

                            <p className="text-center text-sm text-slate-500 font-bold mb-8">
                                Already have an account?{" "}
                                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 transition-all ml-1 border-b-2 border-indigo-100 hover:border-indigo-600">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fadeInDown 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
