"use client";

import { useState } from "react";
import Image from "next/image";

export default function CourtBookingClient({ sport, user }) {
    const allowedSports = ["badminton", "table tennis", "tennis", "netball", "basketball", "volleyball"];
    const isAllowedSport = allowedSports.some(s => sport?.name?.toLowerCase().includes(s));

    const [phoneNumber, setPhoneNumber] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [courtLocation, setCourtLocation] = useState("Court 1");
    const [isBooking, setIsBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [error, setError] = useState("");

    // Generate time slots (8:00 AM to 5:00 PM) - user cannot book past 6:00 PM 
    // So last slot ends at 6:00 PM (e.g., 17:00 starting slot)
    const timeSlots = [
        "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    // Get today's date in YYYY-MM-DD format to prevent past dates
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

        // Basic front-end validation
        if (!phoneNumber || !bookingDate || !timeSlot || !courtLocation) {
            setError("Please fill in all fields.");
            setIsBooking(false);
            return;
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError("Please enter a valid phone number (at least 10 digits).");
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

    if (!isAllowedSport) {
         return (
             <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 shadow-sm">
                    <div className="text-6xl mb-6">🚫</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Court Booking Not Available</h3>
                    <p className="text-gray-500">
                        Court reservations are only available for designated court sports 
                        (Badminton, Table Tennis, Tennis, Netball, Basketball, etc).
                    </p>
                </div>
             </div>
         );
    }

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
                     
                     <button 
                         onClick={() => { setBookingResult(null); setBookingDate(""); setTimeSlot(""); }}
                         className="px-8 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all"
                     >
                         Book Another
                     </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="bg-white rounded-[40px] p-10 shadow-xl overflow-hidden relative">
                <div className="mb-10 text-center">
                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">New Court Booking</h2>
                    <p className="text-gray-500 font-medium">For {sport.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Auto-filled User Details */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Student ID/IT Number</div>
                            <div className="text-gray-900 font-bold truncate">{user?.universityId || <span className="text-rose-400 text-[10px] italic">Login Required</span>}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Email</div>
                            <div className="text-gray-900 font-bold truncate">{user?.universityEmail || <span className="text-rose-400 text-[10px] italic">Login Required</span>}</div>
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
                                className="bg-transparent border-none font-bold text-lg text-gray-900 w-full focus:outline-none placeholder:text-gray-300"
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
    );
}
