"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function PersonalRequestForm({ type, coaches, onClose, onSuccess }) {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        coachId: "",
        contactNumber: "",
        details: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/student/exercise-plan-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, type }),
            });

            if (res.ok) {
                onSuccess?.();
            } else {
                throw new Error("Failed to submit request");
            }
        } catch (err) {
            console.error("Plan request error:", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-50 rounded-[24px] flex items-center justify-center text-3xl">
                        {type === "EXERCISE" ? "💪" : "🥗"}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Request {type.toLowerCase()} Plan</h3>
                        <p className="text-gray-400 text-sm font-medium">Get a custom {type.toLowerCase()} strategy from our top coaches.</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 font-black text-xl">✕</button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Full Name</label>
                        <input type="text" value={session?.user?.name || ""} disabled className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 outline-none cursor-not-allowed shadow-inner" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Contact Number</label>
                        <input required type="tel" placeholder="e.g. +1 234 567 890" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 ring-indigo-50/50 transition-all placeholder:text-gray-300" />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Select Department Coach</label>
                    <select required value={formData.coachId} onChange={(e) => setFormData({...formData, coachId: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 ring-indigo-50/50 transition-all">
                        <option value="" disabled>Choose a coach to guide you...</option>
                        {coaches.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 block">Additional Goals/Details</label>
                    <textarea required placeholder="e.g. Focus on strength, preparing for tournament, vegan preferences, etc." rows="4" value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 ring-indigo-50/50 transition-all resize-none placeholder:text-gray-300" />
                </div>

                <div className="pt-4 flex gap-4">
                     {onClose && (
                        <button type="button" onClick={onClose} className="flex-1 py-4.5 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
                            Cancel
                        </button>
                    )}
                    <button disabled={isSubmitting} type="submit" className="flex-[2] bg-gray-900 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-xl shadow-gray-200">
                        {isSubmitting ? "Submitting..." : "Send Request to Coach"}
                    </button>
                </div>
            </form>
        </div>
    );
}
