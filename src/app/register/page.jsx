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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

            <div className="flex w-full h-full flex-col lg:flex-row">
                {/* Left Side - Branding & Illustration */}
                <div className="hidden lg:flex lg:w-[30%] bg-gradient-to-br from-[#a5b4fc] to-[#818cf8] p-12 flex-col justify-between relative overflow-hidden h-full">
                    <div className="z-10 animate-fade-in-down mt-6">
                        <h1 className="text-white text-4xl font-extrabold tracking-tight drop-shadow-sm">Join Us</h1>
                        <p className="text-indigo-50 text-base mt-3 font-medium opacity-90 leading-relaxed max-w-xs">
                            Start your journey with UniSportHub and unlock your potential.
                        </p>
                    </div>

                    <div className="relative z-10 w-full h-[250px] flex items-center justify-center">
                        <img
                            src="/images/illustration.png"
                            alt="Student Athlete Illustration"
                            className="w-full h-full object-contain animate-float drop-shadow-2xl"
                        />
                    </div>

                    <div className="z-10 text-indigo-100 font-bold opacity-60 text-[10px] tracking-widest uppercase">
                        © 2024 UniSportHub. SLIIT.
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-[60px]"></div>
                    <div className="absolute bottom-[10%] left-[-20%] w-80 h-80 bg-indigo-900 opacity-20 rounded-full blur-[80px]"></div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-[70%] p-6 lg:p-12 flex flex-col justify-center bg-white h-full custom-scrollbar overflow-y-auto">
                    <div className="max-w-3xl mx-auto w-full space-y-4 py-4 animate-fade-in">
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
                                <span className="text-indigo-600 font-bold text-xs cursor-pointer hover:underline transition-all hidden sm:block uppercase tracking-tighter">NEW REGISTRATION</span>
                            </div>
                            <p className="text-slate-500 font-medium text-base">Join the SLIIT sports community.</p>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-rose-50 p-3 border border-rose-100 animate-shake flex items-center gap-3">
                                <div className="bg-rose-500 rounded-full p-1 text-white shadow-sm">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                                <p className="text-xs text-rose-700 font-bold">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100 animate-fade-in flex items-center gap-3">
                                <div className="bg-emerald-500 rounded-full p-1 text-white shadow-sm">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p className="text-xs text-emerald-700 font-bold">{success}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Grid layout for fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                <div className="relative group">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full border-b-2 border-slate-100 py-2 bg-transparent text-slate-900 placeholder-transparent focus:border-indigo-600 focus:outline-none transition-all duration-300 peer text-base font-medium"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="name" className="absolute left-0 -top-2.5 text-slate-400 text-xs font-bold transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-indigo-600 peer-focus:text-xs cursor-text uppercase tracking-wider">Full Name</label>
                                </div>

                                <div className="relative group">
                                    <select
                                        id="faculty"
                                        name="faculty"
                                        required
                                        className="w-full border-b-2 border-slate-100 py-2 bg-transparent text-slate-800 focus:border-indigo-600 focus:outline-none transition-all duration-300 text-base font-medium appearance-none cursor-pointer"
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
                                    <div className="absolute right-0 top-3 pointer-events-none text-slate-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                    <label htmlFor="faculty" className="absolute left-0 -top-2.5 text-indigo-600 text-xs font-extrabold uppercase tracking-wider">Faculty</label>
                                </div>

                                <div className="relative group">
                                    <input
                                        id="universityId"
                                        name="universityId"
                                        type="text"
                                        required
                                        className={`w-full border-b-2 py-2 bg-transparent text-slate-900 placeholder-transparent focus:outline-none transition-all duration-300 peer text-base font-medium ${idError ? "border-rose-300 focus:border-rose-500" : "border-slate-100 focus:border-indigo-600"}`}
                                        placeholder="Registration Number"
                                        value={formData.universityId}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="universityId" className={`absolute left-0 -top-2.5 text-xs font-bold transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-xs cursor-text uppercase tracking-wider ${idError ? "text-rose-500" : "text-slate-400"}`}>Registration No</label>
                                    {idError ? (
                                        <p className="absolute -bottom-4 left-0 text-[9px] text-rose-500 font-bold">{idError}</p>
                                    ) : formData.universityId && formData.faculty && (
                                        <p className="absolute -bottom-4 left-0 text-[10px] text-emerald-500 font-bold">✓ ID Valid</p>
                                    )}
                                </div>

                                <div className="relative group">
                                    <input
                                        id="universityEmail"
                                        name="universityEmail"
                                        type="email"
                                        required
                                        className={`w-full border-b-2 py-2 bg-transparent text-slate-900 placeholder-transparent focus:outline-none transition-all duration-300 peer text-base font-medium ${emailError ? "border-rose-300 focus:border-rose-500" : "border-slate-100 focus:border-indigo-600"}`}
                                        placeholder="University Email"
                                        value={formData.universityEmail}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="universityEmail" className={`absolute left-0 -top-2.5 text-xs font-bold transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-xs cursor-text uppercase tracking-wider ${emailError ? "text-rose-500" : "text-slate-400"}`}>Email</label>
                                    {emailError && (
                                        <p className="absolute -bottom-4 left-0 text-[9px] text-rose-500 font-bold">{emailError}</p>
                                    )}
                                </div>

                                <div className="relative group">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className={`w-full border-b-2 py-2 bg-transparent text-slate-900 placeholder-transparent focus:outline-none transition-all duration-300 peer text-base font-medium pr-10 ${passwordError && formData.password ? "border-rose-300 focus:border-rose-500" : "border-slate-100 focus:border-indigo-600"}`}
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="password" className="absolute left-0 -top-2.5 text-slate-400 text-xs font-bold transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-indigo-600 peer-focus:text-xs cursor-text uppercase tracking-wider">Password</label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-2 text-slate-300 hover:text-indigo-600 transition-colors"
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
                                    
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {[
                                            { label: "8+ Char", test: (pw) => pw.length >= 8 },
                                            { label: "Aa", test: (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw) },
                                            { label: "123", test: (pw) => /\d/.test(pw) },
                                            { label: "#@$", test: (pw) => /[@$!%*?&]/.test(pw) },
                                        ].map((req, i) => {
                                            const isDone = req.test(formData.password);
                                            return (
                                                <div key={i} className={`flex items-center px-2 py-0.5 rounded text-[8px] font-black border transition-all duration-300 ${isDone ? "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm" : "bg-slate-50 border-slate-50 text-slate-300/50"}`}>
                                                    {isDone ? "✓ " : ""}{req.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="relative group">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className={`w-full border-b-2 py-2 bg-transparent text-slate-900 placeholder-transparent focus:outline-none transition-all duration-300 peer text-base font-medium pr-10 ${formData.confirmPassword && formData.confirmPassword !== formData.password ? "border-rose-300 focus:border-rose-500" : "border-slate-100 focus:border-indigo-600"}`}
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="confirmPassword" className="absolute left-0 -top-2.5 text-slate-400 text-xs font-bold transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-indigo-600 peer-focus:text-xs cursor-text uppercase tracking-wider">Confirm</label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-0 top-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                    >
                                        {showConfirmPassword ? (
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
                                    {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                                        <p className="absolute -bottom-4 left-0 text-[10px] text-rose-500 font-bold">Mismatched</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#4f46e5] text-white py-3.5 rounded-xl text-base font-black shadow-[0_15px_30px_-10px_rgba(79,70,229,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:bg-[#4338ca] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:bg-indigo-300 disabled:shadow-none disabled:translate-y-0"
                                >
                                    {loading ? "CREATING…" : "REGISTER NOW"}
                                </button>

                                <p className="text-center text-sm text-slate-400 font-bold">
                                    Already a member?{" "}
                                    <Link href="/login" className="text-indigo-600 hover:underline ml-1">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
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
