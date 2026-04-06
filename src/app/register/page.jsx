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
                                <p className="text-sm text-rose-700 font-bold">{error}</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">

                                {/* Full Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Full Name</label>
                                    <input
                                        id="name" name="name" type="text" required
                                        className="w-full border-b-2 border-slate-200 py-2 bg-transparent text-slate-900 text-base font-medium focus:border-indigo-600 focus:outline-none transition-all duration-200"
                                        placeholder="e.g. John Silva"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Faculty */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest">Faculty</label>
                                    <div className="relative">
                                        <select
                                            id="faculty" name="faculty" required
                                            className="w-full border-b-2 border-slate-200 py-2 bg-transparent text-slate-800 text-base font-medium focus:border-indigo-600 focus:outline-none appearance-none cursor-pointer transition-all duration-200"
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
                                    </div>
                                </div>

                                {/* Registration No */}
                                <div className="flex flex-col gap-1.5">
                                    <label className={`text-[11px] font-extrabold uppercase tracking-widest ${idError ? "text-rose-500" : "text-slate-500"}`}>Registration No</label>
                                    <input
                                        id="universityId" name="universityId" type="text" required
                                        className={`w-full border-b-2 py-2 bg-transparent text-slate-900 text-base font-medium focus:outline-none transition-all duration-200 ${idError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-indigo-600"}`}
                                        placeholder="e.g. IT12345678"
                                        value={formData.universityId}
                                        onChange={handleChange}
                                    />
                                    {idError ? (
                                        <div className="flex items-start gap-2 mt-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-3 py-2">
                                            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                            <p className="text-[11px] font-semibold leading-tight">{idError}</p>
                                        </div>
                                    ) : formData.universityId && formData.faculty && (
                                        <div className="flex items-center gap-1.5 mt-1 text-emerald-600">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                            <p className="text-[11px] font-bold">Registration ID is valid</p>
                                        </div>
                                    )}
                                </div>

                                {/* University Email */}
                                <div className="flex flex-col gap-1.5">
                                    <label className={`text-[11px] font-extrabold uppercase tracking-widest ${emailError ? "text-rose-500" : "text-slate-500"}`}>Email</label>
                                    <input
                                        id="universityEmail" name="universityEmail" type="email" required
                                        className={`w-full border-b-2 py-2 bg-transparent text-slate-900 text-base font-medium focus:outline-none transition-all duration-200 ${emailError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-indigo-600"}`}
                                        placeholder="e.g. IT12345678@my.sliit.lk"
                                        value={formData.universityEmail}
                                        onChange={handleChange}
                                    />
                                    {emailError && (
                                        <div className="flex items-start gap-2 mt-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-3 py-2">
                                            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                            <p className="text-[11px] font-semibold leading-tight">{emailError}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Password</label>
                                    <div className="relative">
                                        <input
                                            id="password" name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className={`w-full border-b-2 py-2 pr-10 bg-transparent text-slate-900 text-base font-medium focus:outline-none transition-all duration-200 ${passwordError && formData.password ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-indigo-600"}`}
                                            placeholder="Min 8 chars, Aa, 1, @"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-2.5 text-slate-300 hover:text-indigo-600 transition-colors">
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.136 5.136m13.728 13.728L13.875 18.825" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {[
                                            { label: "8+ Char", test: (pw) => pw.length >= 8 },
                                            { label: "Aa", test: (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw) },
                                            { label: "123", test: (pw) => /\d/.test(pw) },
                                            { label: "#@$", test: (pw) => /[@$!%*?&]/.test(pw) },
                                        ].map((req, i) => {
                                            const isDone = req.test(formData.password);
                                            return (
                                                <span key={i} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 ${isDone ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                                                    {isDone ? "✓" : "○"} {req.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label className={`text-[11px] font-extrabold uppercase tracking-widest ${formData.confirmPassword && formData.confirmPassword !== formData.password ? "text-rose-500" : "text-slate-500"}`}>Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword" name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            className={`w-full border-b-2 py-2 pr-10 bg-transparent text-slate-900 text-base font-medium focus:outline-none transition-all duration-200 ${formData.confirmPassword && formData.confirmPassword !== formData.password ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-indigo-600"}`}
                                            placeholder="Re-enter your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-2.5 text-slate-300 hover:text-indigo-600 transition-colors">
                                            {showConfirmPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.136 5.136m13.728 13.728L13.875 18.825" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                                        <div className="flex items-center gap-2 mt-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-3 py-2">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                            <p className="text-[11px] font-semibold">Passwords don&apos;t match</p>
                                        </div>
                                    )}
                                    {formData.confirmPassword && formData.confirmPassword === formData.password && (
                                        <div className="flex items-center gap-1.5 mt-1 text-emerald-600">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                            <p className="text-[11px] font-bold">Passwords match</p>
                                        </div>
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
