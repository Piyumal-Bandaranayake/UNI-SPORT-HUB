"use client";

import Image from "next/image";
import { useState } from "react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 60;
const DESCRIPTION_MIN_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 300;

const INITIAL_FORM_DATA = {
    name: "",
    description: "",
    image: "",
};

const INITIAL_FIELD_ERRORS = {
    image: "",
    name: "",
    description: "",
};

function validateSportForm(formData) {
    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();
    const errors = { ...INITIAL_FIELD_ERRORS };

    if (!formData.image) {
        errors.image = "Sport icon or image is required.";
    } else if (!formData.image.startsWith("data:image/")) {
        errors.image = "Please upload a valid image file.";
    }

    if (!trimmedName) {
        errors.name = "Sport department name is required.";
    } else if (trimmedName.length < NAME_MIN_LENGTH) {
        errors.name = `Sport department name must be at least ${NAME_MIN_LENGTH} characters.`;
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
        errors.name = `Sport department name must be ${NAME_MAX_LENGTH} characters or fewer.`;
    }

    if (!trimmedDescription) {
        errors.description = "Department synopsis is required.";
    } else if (trimmedDescription.length < DESCRIPTION_MIN_LENGTH) {
        errors.description = `Department synopsis must be at least ${DESCRIPTION_MIN_LENGTH} characters.`;
    } else if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
        errors.description = `Department synopsis must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
    }

    return {
        errors,
        hasErrors: Object.values(errors).some(Boolean),
        sanitizedData: {
            name: trimmedName,
            description: trimmedDescription,
            image: formData.image,
        },
    };
}

export default function CreateSportForm({ onSuccess }) {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [fieldErrors, setFieldErrors] = useState(INITIAL_FIELD_ERRORS);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((current) => ({ ...current, [name]: value }));
        setFieldErrors((current) => ({ ...current, [name]: "" }));
        setError("");
        setSuccess("");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        setSuccess("");
        setError("");
        setFieldErrors((current) => ({ ...current, image: "" }));

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFieldErrors((current) => ({ ...current, image: "Only image files are allowed." }));
            e.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setFieldErrors((current) => ({ ...current, image: "Image size must be less than 5MB." }));
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((current) => ({ ...current, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const { errors, hasErrors, sanitizedData } = validateSportForm(formData);
        setFieldErrors(errors);

        if (hasErrors) {
            setError("Please fix the highlighted fields before creating the sport.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/admin/sports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sanitizedData),
            });

            const result = await response.json();
            setLoading(false);

            if (!response.ok) {
                setError(result.error || "Failed to create sport");
            } else {
                setSuccess(result.success);
                setFormData(INITIAL_FORM_DATA);
                setFieldErrors(INITIAL_FIELD_ERRORS);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Create sport error:", error);
            setError("Something went wrong. Please check your connection.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <div className="mb-4 space-y-3 text-center">
                <div className="group flex flex-col items-center gap-4">
                    <div className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-gray-50 transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/30 ${fieldErrors.image ? "border-red-300 bg-red-50/70" : "border-gray-200"}`}>
                        {formData.image ? (
                            <Image
                                src={formData.image}
                                alt="Preview"
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        ) : (
                            <span className="text-xs font-black uppercase tracking-widest text-gray-300">Image</span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            aria-invalid={Boolean(fieldErrors.image)}
                            className="absolute inset-0 cursor-pointer opacity-0"
                        />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sport Icon / Image</p>
                        <p className="mt-0.5 text-[9px] text-gray-300">Click box to upload (Max 5MB)</p>
                        {fieldErrors.image && (
                            <p className="mt-2 text-[10px] font-bold text-red-600">{fieldErrors.image}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="sport-name" className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
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
                    maxLength={NAME_MAX_LENGTH}
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={`w-full rounded-2xl border bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:outline-none focus:ring-4 ${fieldErrors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-100 focus:border-indigo-500 focus:ring-indigo-500/5"}`}
                />
                {fieldErrors.name && (
                    <p className="ml-1 text-[10px] font-bold text-red-600">{fieldErrors.name}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="sport-description" className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Department Synopsis
                </label>
                <textarea
                    id="sport-description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly describe this sports department..."
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    aria-invalid={Boolean(fieldErrors.description)}
                    className={`w-full resize-none rounded-2xl border bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:outline-none focus:ring-4 ${fieldErrors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-gray-100 focus:border-indigo-500 focus:ring-indigo-500/5"}`}
                />
                <div className="flex items-center justify-between px-1">
                    {fieldErrors.description ? (
                        <p className="text-[10px] font-bold text-red-600">{fieldErrors.description}</p>
                    ) : (
                        <span className="text-[10px] text-gray-300">Minimum {DESCRIPTION_MIN_LENGTH} characters</span>
                    )}
                    <span className="text-[10px] text-gray-300">
                        {formData.description.trim().length}/{DESCRIPTION_MAX_LENGTH}
                    </span>
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:bg-indigo-400"
                >
                    {loading ? "Creating..." : "Initialize Sport"}
                </button>
            </div>
        </form>
    );
}
