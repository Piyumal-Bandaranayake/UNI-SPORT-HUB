"use client";

import { useState } from "react";

export default function CreateSportForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size must be less than 5MB");
                e.target.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("/api/admin/sports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            setLoading(false);

            if (!response.ok) {
                setError(result.error || "Failed to create sport");
            } else {
                setSuccess(result.success);
                setFormData({ name: "", description: "", image: "" });
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Create sport error:", error);
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

            <div className="space-y-3 mb-4 text-center">
                <div className="flex flex-col items-center gap-4 group">
                    <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/30">
                        {formData.image ? (
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl text-gray-300">🖼️</span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                   <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sport Icon / Image</p>
                        <p className="text-[9px] text-gray-300 mt-0.5">Click box to upload (Max 5MB)</p>
                   </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="sport-name" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Sport Department Name
                </label>
                <input
                    id="sport-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Badminton, Cricket"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="sport-description" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Department Synopsis
                </label>
                <textarea
                    id="sport-description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly describe this sports department..."
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none"
                />
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:bg-indigo-400 transition-all shadow-xl shadow-indigo-100"
                >
                    {loading ? "Creating..." : "Initialize Sport"}
                </button>
            </div>
        </form>
    );
}
