"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function CourtBookingClient({ sport, user }) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [courtLocation, setCourtLocation] = useState("Court 1");
    const [isBooking, setIsBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [error, setError] = useState("");

    // AI Suggestions State
    const [suggestions, setSuggestions] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiMessage, setAiMessage] = useState("");

    // Generate time slots (8:00 AM to 5:00 PM)
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

        if (!user) {
            setError("Please login first to reserve a court.");
            setIsBooking(false);
            return;
        }

        if (!phoneNumber || !bookingDate || !timeSlot || !courtLocation) {
            setError("Please fill in all fields.");
            setIsBooking(false);
            return;
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError("Please enter a valid phone number.");
            setIsBooking(false);
            return;
        }

        try {
            const res = await fetch("/api/court-bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sportId: sport._id,
                    sportName: sport.name,
                    phoneNumber,
                    bookingDate,
                    timeSlot,
                    courtLocation
                })
            });

            const data = await res.json();
            if (res.ok) {
                setBookingResult(data);
            } else {
                setError(data.error || "An error occurred during booking.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    if (bookingResult) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="bg-white rounded-[40px] p-20 text-center border shadow-xl">
                     <div className="text-6xl mb-6 text-emerald-500 font-black">SUCCESS!</div>
                     <h3 className="text-3xl font-bold text-gray-900 mb-4">Court Booked Successfully</h3>
                     <p className="text-gray-500 mb-8 font-medium">Your court reservation has been confirmed for {bookingDate} at {timeSlot}.</p>
                     
                     <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 text-left">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Location</div>
                            <div className="text-gray-900 font-bold truncate">{bookingResult.booking.courtLocation}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Sport</div>
                            <div className="text-gray-900 font-bold truncate">{bookingResult.booking.sportName}</div>
                        </div>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                         <button 
                             onClick={() => { setBookingResult(null); setBookingDate(""); setTimeSlot(""); }}
                             className="w-full sm:w-auto px-8 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                         >
                             Book Another
                         </button>
                         <Link 
                            href={`/sports/${sport._id}`}
                            className="w-full sm:w-auto px-8 bg-white text-gray-900 border-2 border-gray-100 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
                         >
                            Back to {sport.name}
                         </Link>
                     </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="bg-white rounded-[40px] shadow-xl overflow-hidden relative grid grid-cols-1 lg:grid-cols-2">
                {/* Left Side: Sport Image - Visible only on LG up, or as a banner on mobile */}
                <div className={`${sport.image ? 'block' : 'hidden'} h-64 lg:h-full relative group`}>
                    {sport.image && (
                        <img 
                            src={sport.image} 
                            alt={sport.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white/10 via-transparent to-transparent"></div>
                </div>

                {/* Right Side: Form Content */}
                <div className="p-8 lg:p-12">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">New Court Booking</h2>
                        <p className="text-gray-500 font-medium">Reserve your spot for <span className="text-indigo-600 font-bold">{sport.name}</span></p>
                     </div>

                     {/* AI Suggestion Section */}
                     <div className="mb-10 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[32px] border border-indigo-100/50 shadow-inner relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all pointer-events-none">
                            <span className="text-6xl text-indigo-600">✨</span>
                         </div>
                         
                         <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="text-center md:text-left">
                                <h4 className="text-lg font-black text-indigo-900 mb-1 flex items-center gap-2 justify-center md:justify-start">
                                    <span className="animate-pulse">✨</span> AI Best Time Suggestion
                                </h4>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest leading-loose">
                                    Our AI analyzes {sport.name} usage patterns to find the best slot.
                                </p>
                            </div>

                            <button 
                                onClick={async () => {
                                    if (!bookingDate) {
                                        setAiMessage("Select a date to get AI recommendations.");
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
                                }}
                                disabled={isAnalyzing}
                                className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isAnalyzing ? "Analyzing Availability..." : "✨ Suggest Best Time"}
                            </button>
                         </div>

                         {aiMessage && (
                             <div className="mt-4 text-center text-[10px] font-bold text-rose-500 uppercase tracking-widest animate-in fade-in duration-300">
                                 ⚠ {aiMessage}
                             </div>
                         )}

                         {suggestions.length > 0 && (
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in slide-in-from-bottom-4 duration-500">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setTimeSlot(s.time)}
                                        className={`group/suggest text-left p-4 rounded-2xl transition-all border-2 ${timeSlot === s.time ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-transparent hover:border-indigo-200'}`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-lg font-black ${timeSlot === s.time ? 'text-white' : 'text-gray-900 group-hover/suggest:text-indigo-600'}`}>
                                                {s.time}
                                            </span>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${timeSlot === s.time ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {s.score}% Match
                                            </span>
                                        </div>
                                        <p className={`text-[9px] font-bold leading-tight ${timeSlot === s.time ? 'text-white/70' : 'text-gray-400'}`}>
                                            {s.reason}
                                        </p>
                                    </button>
                                ))}
                            </div>
                         )}
                     </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Auto-filled User Details */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Full Name</div>
                                <div className="text-gray-900 font-bold truncate">{user?.name || <span className="text-rose-400 text-[10px] italic">Login Required</span>}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Email Address</div>
                                <div className="text-gray-900 font-bold truncate">{user?.universityEmail || user?.email || <span className="text-rose-400 text-[10px] italic">Login Required</span>}</div>
                            </div>
                            
                            <div className="p-4 bg-white border-2 border-indigo-600/20 rounded-2xl group focus-within:border-indigo-600 transition-all md:col-span-2">
                                <label className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-1 block">Phone Number</label>
                                <input 
                                    required
                                    type="tel" 
                                    placeholder="e.g. +94 77 123 4567"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="bg-transparent border-none font-bold text-lg text-gray-900 w-full focus:outline-none placeholder:text-gray-300"
                                />
                            </div>

                            <div className="p-4 bg-white border-2 border-indigo-600/20 rounded-2xl group focus-within:border-indigo-600 transition-all">
                                <label className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-1 block">Date</label>
                                <input 
                                    required
                                    type="date" 
                                    min={today}
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    className="bg-transparent border-none font-bold text-lg text-gray-900 w-full focus:outline-none placeholder:text-gray-300 pointer-events-auto"
                                />
                            </div>

                            <div className="p-4 bg-white border-2 border-indigo-600/20 rounded-2xl group focus-within:border-indigo-600 transition-all">
                                <label className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-1 block">Time Slot</label>
                                <select 
                                    required
                                    value={timeSlot}
                                    onChange={(e) => setTimeSlot(e.target.value)}
                                    className="bg-transparent border-none font-bold text-lg text-gray-900 w-full focus:outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Time</option>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-4 bg-white border-2 border-indigo-600/20 rounded-2xl group focus-within:border-indigo-600 transition-all md:col-span-2">
                                <label className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-1 block">Court Location</label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${courtLocation === 'Court 1' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                                        <input 
                                            type="radio" 
                                            name="courtLocation" 
                                            value="Court 1" 
                                            checked={courtLocation === "Court 1"}
                                            onChange={(e) => setCourtLocation(e.target.value)}
                                            className="hidden"
                                        />
                                        <span className="font-bold">Court 1</span>
                                    </label>
                                    <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${courtLocation === 'Court 2' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                                        <input 
                                            type="radio" 
                                            name="courtLocation" 
                                            value="Court 2" 
                                            checked={courtLocation === "Court 2"}
                                            onChange={(e) => setCourtLocation(e.target.value)}
                                            className="hidden"
                                        />
                                        <span className="font-bold">Court 2</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-rose-500 text-sm font-bold bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isBooking}
                            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                        >
                            {isBooking ? "Reserving..." : "Confirm Reservation"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
