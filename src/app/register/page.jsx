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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-24 pb-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Student Registration
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create your account to manage sports activities
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="rounded-md bg-green-50 p-4 border border-green-200">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm mt-1"
                                placeholder="Ex: John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">Faculty</label>
                            <select
                                id="faculty"
                                name="faculty"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm mt-1 bg-white"
                                value={formData.faculty}
                                onChange={handleChange}
                            >
                                <option value="" disabled>-- Select your Faculty --</option>
                                <option value="IT">IT – Faculty of Information Technology</option>
                                <option value="BM">BM – Faculty of Business Management</option>
                                <option value="ENG">ENG – Faculty of Engineering</option>
                                <option value="HM">HM – Faculty of Hospitality Management</option>
                                <option value="AR">AR – Faculty of Agriculture</option>
                                <option value="HU">HU – Faculty of Humanities</option>
                                <option value="FA">FA – Faculty of Fine Arts</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">Registration Number</label>
                            <input
                                id="universityId"
                                name="universityId"
                                type="text"
                                required
                                className={`relative block w-full appearance-none rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm mt-1 ${
                                    idError
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                }`}
                                placeholder={formData.faculty ? `${formData.faculty}12345678` : "Select a faculty first"}
                                value={formData.universityId}
                                onChange={handleChange}
                            />
                            {idError && (
                                <p className="mt-1 text-xs text-red-600">{idError}</p>
                            )}
                            {!idError && formData.universityId && formData.faculty && (
                                <p className="mt-1 text-xs text-green-600">✓ Registration number format is valid</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="universityEmail" className="block text-sm font-medium text-gray-700">University Email</label>
                            <input
                                id="universityEmail"
                                name="universityEmail"
                                type="email"
                                required
                                className={`relative block w-full appearance-none rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm mt-1 ${
                                    emailError
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                }`}
                                placeholder={formData.universityId ? `${formData.universityId}@my.sliit.lk` : "Enter registration number first"}
                                value={formData.universityEmail}
                                onChange={handleChange}
                            />
                            {emailError && (
                                <p className="mt-1 text-xs text-red-600">{emailError}</p>
                            )}
                            {!emailError && formData.universityEmail && formData.universityId && (
                                <p className="mt-1 text-xs text-green-600">✓ University email is valid</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`relative block w-full appearance-none rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm mt-1 ${
                                    passwordError && formData.password
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                }`}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            
                            {/* Password Requirements Checklist */}
                            <div className="mt-3 grid grid-cols-1 gap-1 text-[11px]">
                                {[
                                    { label: "8+ Characters", test: (pw) => pw.length >= 8 },
                                    { label: "Uppercase & Lowercase", test: (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw) },
                                    { label: "Number", test: (pw) => /\d/.test(pw) },
                                    { label: "Special Character (@$!%*?&)", test: (pw) => /[@$!%*?&]/.test(pw) },
                                ].map((req, i) => {
                                    const isDone = req.test(formData.password);
                                    return (
                                        <div key={i} className={`flex items-center space-x-2 ${isDone ? "text-green-600 font-medium" : "text-gray-400"}`}>
                                            <span className={`w-3 h-3 flex items-center justify-center rounded-full border ${isDone ? "bg-green-100 border-green-500" : "border-gray-200"}`}>
                                                {isDone && "✓"}
                                            </span>
                                            <span>{req.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm mt-1"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                        >
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Login here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
