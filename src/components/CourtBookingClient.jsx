"use client";

import { useState } from "react";
import Link from "next/link";

export default function CourtBookingClient({ sport, user }) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [courtLocation, setCourtLocation] = useState("Court 1");
    const [isBooking, setIsBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [error, setError] = useState("");

    const [suggestions, setSuggestions] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiMessage, setAiMessage] = useState("");

    const timeSlots = [
        "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00",
        "18:00", "19:00", "20:00", "21:00"
    ];

    const today = new Date().toISOString().split("T")[0];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsBooking(true);
        setError("");

        if (!user) { setError("Please login first to reserve a court."); setIsBooking(false); return; }
        if (!phoneNumber || !bookingDate || !timeSlot || !courtLocation) { setError("Please fill in all fields."); setIsBooking(false); return; }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) { setError("Please enter a valid phone number."); setIsBooking(false); return; }

        try {
            const res = await fetch("/api/court-bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sportId: sport._id, sportName: sport.name, phoneNumber, bookingDate, timeSlot, courtLocation })
            });
            const data = await res.json();
            if (res.ok) setBookingResult(data);
            else setError(data.error || "An error occurred during booking.");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    const handleAISuggest = async () => {
        if (!bookingDate) {
            setAiMessage("Please select a date first to get AI recommendations.");
            setTimeout(() => setAiMessage(""), 3000);
            return;
        }
        setIsAnalyzing(true);
        setSuggestions([]);
        try {
            const res = await fetch("/api/ai/suggest-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sportId: sport._id, bookingDate })
            });
            const data = await res.json();
            if (res.ok) setSuggestions(data.suggestions);
            else setAiMessage(data.error);
        } catch {
            setAiMessage("AI engine is currently offline.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ── SUCCESS SCREEN ────────────────────────────────────────────
    if (bookingResult) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-100/50 border border-emerald-100 overflow-hidden">
                        {/* Top accent bar */}
                        <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Reservation Confirmed!</h3>
                            <p className="text-gray-500 font-medium mb-8">
                                Your court is booked for <span className="text-indigo-600 font-bold">{bookingDate}</span> at <span className="text-indigo-600 font-bold">{timeSlot}</span>
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {[
                                    { label: "Sport", value: bookingResult.booking.sportName },
                                    { label: "Court", value: bookingResult.booking.courtLocation },
                                    { label: "Date", value: bookingDate },
                                    { label: "Time", value: timeSlot },
                                ].map(item => (
                                    <div key={item.label} className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-gray-900 font-bold text-sm truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {bookingResult.booking.qrCode && (
                                <div className="mb-8">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Show this QR at the venue</p>
                                    <div className="inline-block bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                                        <img src={bookingResult.booking.qrCode} alt="Booking QR" className="w-40 h-40 mx-auto" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium mt-3">Present this to sports department staff to verify your booking.</p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/dashboard/student" className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all text-center">
                                    My Dashboard
                                </Link>
                                <button
                                    onClick={() => { setBookingResult(null); setBookingDate(""); setTimeSlot(""); }}
                                    className="flex-1 bg-white text-gray-700 border-2 border-gray-100 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Book Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── MAIN BOOKING FORM ────────────────────────────────────────
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                {/* ── LEFT PANEL: sport image + info ── */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                    {/* Sport Card */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 aspect-[4/3] shadow-2xl shadow-indigo-200/40">
                        {sport.image && (
                            <img src={sport.image} alt={sport.name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6">
                            <span className="inline-block bg-white/20 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 border border-white/20">
                                {sport.category || "Sport"}
                            </span>
                            <h3 className="text-2xl font-black text-white">{sport.name}</h3>
                            <p className="text-white/60 font-medium text-sm mt-1">Court Reservation</p>
                        </div>
                    </div>

                    {/* Info tiles */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: "🕐", label: "Hours", value: "8 AM – 9 PM" },
                            { icon: "📍", label: "Venue", value: "Sports Complex" },
                            { icon: "🏟️", label: "Courts", value: "2 Available" },
                            { icon: "⏱️", label: "Duration", value: "1 Hour Slot" },
                        ].map(tile => (
                            <div key={tile.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                <div className="text-2xl mb-2">{tile.icon}</div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tile.label}</p>
                                <p className="text-gray-900 font-bold text-sm">{tile.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT PANEL: booking form ── */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/80 overflow-hidden">
                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 border-b border-gray-50">
                            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">Reserve Your Spot</p>
                            <h2 className="text-2xl font-black text-gray-900">New Court Booking</h2>
                            <p className="text-gray-400 font-medium text-sm mt-1">for <span className="text-indigo-600 font-bold">{sport.name}</span></p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* ── AI Suggestion ── */}
                            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border border-indigo-100 p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-lg shrink-0">✨</div>
                                        <div>
                                            <p className="font-black text-indigo-900 text-sm">AI Best Time</p>
                                            <p className="text-[11px] text-indigo-500 font-medium">Pick a date first, then get smart slot suggestions</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAISuggest}
                                        disabled={isAnalyzing}
                                        className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-indigo-200"
                                    >
                                        {isAnalyzing ? "..." : "Suggest"}
                                    </button>
                                </div>

                                {aiMessage && (
                                    <p className="mt-3 text-[11px] font-bold text-rose-500 bg-rose-50 rounded-lg px-3 py-2">{aiMessage}</p>
                                )}

                                {suggestions.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        {suggestions.map((s, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setTimeSlot(s.time)}
                                                className={`text-center p-3 rounded-xl border-2 transition-all ${timeSlot === s.time ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-transparent hover:border-indigo-200 text-gray-900"}`}
                                            >
                                                <div className="font-black text-sm">{s.time}</div>
                                                <div className={`text-[9px] font-black uppercase mt-0.5 ${timeSlot === s.time ? "text-indigo-200" : "text-emerald-500"}`}>{s.score}% match</div>
                                                <p className={`text-[9px] mt-1 leading-tight ${timeSlot === s.time ? "text-white/70" : "text-gray-400"}`}>{s.reason}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* User info (read-only) */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                                        <p className="font-bold text-gray-900 text-sm truncate">{user?.name || <span className="text-rose-400 italic text-xs">Login Required</span>}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                        <p className="font-bold text-gray-900 text-sm truncate">{user?.universityEmail || user?.email || <span className="text-rose-400 italic text-xs">Login Required</span>}</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Phone Number</label>
                                    <div className="flex items-center gap-3 border-2 border-gray-100 group-focus-within:border-indigo-500 rounded-2xl px-4 py-3 bg-white transition-all">
                                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                        <input
                                            required type="tel" placeholder="+94 77 123 4567"
                                            value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="bg-transparent font-bold text-gray-900 w-full focus:outline-none placeholder:text-gray-300 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Date</label>
                                        <div className="border-2 border-gray-100 group-focus-within:border-indigo-500 rounded-2xl px-4 py-3 bg-white transition-all flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                            <input
                                                required type="date" min={today}
                                                value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                                                className="bg-transparent font-bold text-gray-900 w-full focus:outline-none text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Time Slot</label>
                                        <div className="border-2 border-gray-100 group-focus-within:border-indigo-500 rounded-2xl px-4 py-3 bg-white transition-all flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <select
                                                required value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}
                                                className="bg-transparent font-bold text-gray-900 w-full focus:outline-none cursor-pointer text-sm appearance-none"
                                            >
                                                <option value="" disabled>Pick time</option>
                                                {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Court selection */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Court Location</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["Court 1", "Court 2"].map(court => (
                                            <label
                                                key={court}
                                                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all font-bold text-sm ${courtLocation === court ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-100 bg-white text-gray-500 hover:border-indigo-200"}`}
                                            >
                                                <input type="radio" name="courtLocation" value={court} checked={courtLocation === court} onChange={(e) => setCourtLocation(e.target.value)} className="hidden" />
                                                <span className="text-lg">{court === "Court 1" ? "🏟️" : "🎯"}</span>
                                                {court}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3">
                                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                        <p className="text-sm font-semibold">{error}</p>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isBooking}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:translate-y-0"
                                >
                                    {isBooking ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                            Reserving Court...
                                        </span>
                                    ) : "Confirm Reservation →"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
