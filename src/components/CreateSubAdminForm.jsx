"use client";

import { useState } from "react";

export default function CreateSubAdminForm({ onSuccess }) {
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
            setError("Full identity name must be at least 3 characters.");
            return;
        }

        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid staff email address.");
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
            const response = await fetch("/api/admin/sub-admins", {
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
                setError(result.error || "Failed to create sub-admin");
            } else {
                setSuccess(result.success);
                setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Create sub-admin error:", error);
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
                <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="sa-name" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Full Identity
                </label>
                <div className="relative">
                    <input
                        id="sa-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Jane Smith"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="sa-email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Staff Email Address
                </label>
                <div className="relative">
                    <input
                        id="sa-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jane@university.hub"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="sa-password" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Access Code
                    </label>
                    <input
                        id="sa-password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="sa-confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Verify Code
                    </label>
                    <input
                        id="sa-confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:bg-indigo-400 transition-all shadow-xl shadow-indigo-100"
                >
                    {loading ? "Creating..." : "Create Sub-Admin"}
                </button>
            </div>
        </form>
    );
}
