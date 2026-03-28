"use client";

import { useState } from "react";
import Link from "next/link";
import { useTransition } from "react";

export default function JoinSportSection({ sportId, session }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [details, setDetails] = useState("");

    const handleSendRequest = async (e) => {
        e.preventDefault();
        setMessage({ type: "loading", text: "Sending your request..." });
        
        try {
            const res = await fetch("/api/student/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sportId, details }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: "success", text: "Your request has been sent successfully!" });
                setShowForm(false);
            } else {
                setMessage({ type: "error", text: data.error || "Failed to send request." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "A network error occurred." });
        }
    };

    if (!session) {
        return (
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-indigo-100/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Interested in joining?</h3>
                <p className="text-gray-500 text-sm mb-8">
                    Start your journey as a professional athlete in our university team.
                </p>
                <Link
                    href="/login"
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-center block hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    Login to Apply
                </Link>
            </div>
        );
    }

    if (session.user.role !== "STUDENT") {
        return null;
    }

    return (
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-indigo-100/20">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Interested in joining?</h3>
            <p className="text-gray-500 text-sm mb-6">
                Start your journey as a professional athlete in our university team.
            </p>

            {message && message.type !== "loading" && (
                <div className={`mb-6 p-4 rounded-2xl text-[10px] font-black uppercase text-center ${
                    message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                    "bg-rose-50 text-rose-600 border border-rose-100"
                }`}>
                    {message.text}
                </div>
            )}

            {!showForm ? (
                <button 
                    onClick={() => setShowForm(true)}
                    disabled={message?.type === "success"}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-center block hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:translate-y-0 hover:-translate-y-1 transition-all shadow-lg shadow-indigo-100"
                >
                    {message?.type === "success" ? "Request Already Sent" : "Send Join Request"}
                </button>
            ) : (
                <form onSubmit={handleSendRequest} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Tell us why you want to join</label>
                        <textarea 
                            required
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                            placeholder="Share your experience or motivation..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="flex-1 bg-gray-50 text-gray-400 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={message?.type === "loading"}
                            className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            {message?.type === "loading" ? "Processing..." : "Submit Join Request"}
                        </button>
                    </div>
                </form>
            )}

            <p className="mt-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Response typical within 24-48 hours
            </p>
        </div>
    );
}
