"use client";

import { useState } from "react";

export default function CreateCoachForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Client-side Validation
        const trimmedName = formData.name.trim();
        const trimmedEmail = formData.email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (trimmedName.length < 3) {
            setError("Coach identity name must be at least 3 characters.");
            return;
        }

        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid coach email address.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Access code must be at least 8 characters long.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Access codes do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/admin/coaches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    name: trimmedName,
                    email: trimmedEmail
                }),
            });

            const result = await response.json();
            setLoading(false);

            if (!response.ok) {
                setError(result.error || "Failed to create coach");
            } else {
                setSuccess(result.success);
                setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Create coach error:", error);
            setError("Something went wrong. Please check your connection.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                    {success}
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="coach-name" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">
                    Coach Identity
                </label>
                <div className="relative">
                    <input
                        id="coach-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Coach Michael"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="coach-email" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">
                    Coach Email Address
                </label>
                <div className="relative">
                    <input
                        id="coach-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="michael@university.hub"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="coach-password" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">
                        Access Code
                    </label>
                    <input
                        id="coach-password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="coach-confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">
                        Verify Code
                    </label>
                    <input
                        id="coach-confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:bg-emerald-400 transition-all shadow-xl shadow-emerald-100"
                >
                    {loading ? "Creating..." : "Create Coach"}
                </button>
            </div>
        </form>
    );
}
