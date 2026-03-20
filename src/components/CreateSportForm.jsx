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

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sport Image
                </label>
                <div className="flex items-center gap-4">
                    {formData.image && (
                        <img src={formData.image} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="sport-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Sport Name
                </label>
                <input
                    id="sport-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Football"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="sport-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                </label>
                <textarea
                    id="sport-description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Ex: University first team football"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 transition-colors"
            >
                {loading ? "Creating..." : "Create Sport"}
            </button>
        </form>
    );
}
