"use client";

import { useState } from "react";

export default function EquipmentBookingClient({ equipments, user }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isBooking, setIsBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleOpenBooking = (item) => {
        if (item.available <= 0) return;
        setSelectedItem(item);
        setQuantity(1);
        setPhoneNumber("");
        setBookingResult(null);
        setError("");
    };

    const handleCloseBooking = () => {
        setSelectedItem(null);
        setBookingResult(null);
        setError("");
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setIsBooking(true);
        setError("");

        if (!user) { setError("Please login first to book equipment."); setIsBooking(false); return; }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) { setError("Please enter a valid phone number (at least 10 digits)."); setIsBooking(false); return; }

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ equipmentId: selectedItem._id, quantity, phoneNumber })
            });
            const data = await res.json();
            if (res.ok) {
                setBookingResult(data);
                selectedItem.available -= quantity;
            } else {
                setError(data.error || "An error occurred");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    const filtered = equipments.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

            {/* Search + Stats bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-black text-gray-900">Available Gear</h2>
                    <p className="text-sm text-gray-400 font-medium mt-0.5">{equipments.filter(e => e.available > 0).length} of {equipments.length} items in stock</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search equipment..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:border-indigo-400 transition-all placeholder:text-gray-300 shadow-sm"
                    />
                </div>
            </div>

            {/* Equipment Grid */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                    <div className="text-6xl mb-6">📦</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Equipment Found</h3>
                    <p className="text-gray-400 font-medium">Try adjusting your search or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((item) => (
                        <EquipmentCard key={item._id} equipment={item} onBook={() => handleOpenBooking(item)} />
                    ))}
                </div>
            )}

            {/* Booking Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={handleCloseBooking} />
                    <div className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl">

                        {/* Modal top accent */}
                        <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />

                        {bookingResult ? (
                            /* ── SUCCESS ── */
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Booking Confirmed!</h3>
                                <p className="text-gray-400 font-medium text-sm mb-6">Show this QR code at the sports facility to collect your gear.</p>

                                <div className="bg-indigo-50 p-5 rounded-2xl inline-block mb-6 border border-indigo-100">
                                    <img src={bookingResult.qrCode} alt="Booking QR" className="w-40 h-40 mx-auto" />
                                </div>

                                <button
                                    onClick={handleCloseBooking}
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            /* ── BOOKING FORM ── */
                            <div className="p-7">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Equipment Rental</p>
                                        <h2 className="text-xl font-black text-gray-900">Book Item</h2>
                                    </div>
                                    <button onClick={handleCloseBooking} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                {/* Item summary */}
                                <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-5">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shrink-0">📦</div>
                                    <div className="min-w-0">
                                        <p className="font-black text-gray-900 text-sm truncate">{selectedItem.name}</p>
                                        <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest">{selectedItem.category} · {selectedItem.available} available</p>
                                    </div>
                                </div>

                                <form onSubmit={handleBookingSubmit} className="space-y-4">
                                    {/* User info */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-2xl px-3.5 py-3 border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Student ID</p>
                                            <p className="font-bold text-gray-900 text-sm truncate">{user?.universityId || <span className="text-rose-400 italic text-xs">Login Required</span>}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl px-3.5 py-3 border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                            <p className="font-bold text-gray-900 text-sm truncate">{user?.universityEmail || <span className="text-rose-400 italic text-xs">Login Required</span>}</p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Phone Number</label>
                                        <div className="flex items-center gap-2.5 border-2 border-gray-100 focus-within:border-indigo-500 rounded-2xl px-4 py-3 bg-white transition-all">
                                            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                            <input
                                                required type="tel" placeholder="+94 77 123 4567"
                                                value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                                                className="bg-transparent font-bold text-gray-900 w-full focus:outline-none placeholder:text-gray-300 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Quantity</label>
                                        <div className="border-2 border-gray-100 focus-within:border-indigo-500 rounded-2xl px-4 py-3 bg-white transition-all">
                                            <div className="flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-indigo-600 hover:text-white flex items-center justify-center font-black text-gray-700 text-lg transition-all"
                                                >−</button>
                                                <div className="text-center">
                                                    <span className="text-2xl font-black text-gray-900">{quantity}</span>
                                                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">of {selectedItem.available} available</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.min(selectedItem.available, quantity + 1))}
                                                    className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-indigo-600 hover:text-white flex items-center justify-center font-black text-gray-700 text-lg transition-all"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3">
                                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                            <p className="text-sm font-semibold">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isBooking}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:translate-y-0"
                                    >
                                        {isBooking ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                                Confirming...
                                            </span>
                                        ) : "Confirm Booking →"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function EquipmentCard({ equipment, onBook }) {
    const isOutOfStock = equipment.available <= 0 || equipment.status === "OUT_OF_STOCK";
    const isLowStock = !isOutOfStock && equipment.available <= 3;

    const getCategoryIcon = (category) => {
        const cat = category.toUpperCase();
        if (cat.includes("BALL")) return "⚽";
        if (cat.includes("RACKET") || cat.includes("BAT") || cat.includes("PADDLE")) return "🏸";
        if (cat.includes("SHOES") || cat.includes("BOOTS") || cat.includes("SPIKES")) return "👟";
        if (cat.includes("CLOTH") || cat.includes("JERSEY") || cat.includes("UNIFORM")) return "👕";
        if (cat.includes("SAFETY") || cat.includes("GUARD") || cat.includes("HELMET")) return "🛡️";
        return "📦";
    };

    const getConditionColor = (condition) => {
        const c = condition?.toUpperCase();
        if (c === "EXCELLENT" || c === "GOOD") return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (c === "FAIR") return "text-amber-600 bg-amber-50 border-amber-200";
        return "text-rose-600 bg-rose-50 border-rose-200";
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-400 group overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30">
                {equipment.image ? (
                    <img src={equipment.image} alt={equipment.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl opacity-15 select-none group-hover:scale-110 transition-transform duration-500">
                        {getCategoryIcon(equipment.category)}
                    </div>
                )}
                {/* Overlays */}
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border ${isOutOfStock ? "bg-rose-500/85 text-white border-rose-400/20" : isLowStock ? "bg-amber-500/85 text-white border-amber-400/20" : "bg-emerald-500/85 text-white border-emerald-400/20"}`}>
                        {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${equipment.available} left` : "In Stock"}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight border backdrop-blur-md shadow-sm ${getConditionColor(equipment.condition)}`}>
                        {equipment.condition}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{getCategoryIcon(equipment.category)}</span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">
                            {equipment.category}
                        </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-700 transition-colors leading-tight">
                        {equipment.name}
                    </h3>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Available</p>
                        <p className={`text-base font-black ${equipment.available <= 2 ? "text-rose-600" : "text-gray-900"}`}>
                            {equipment.available} <span className="text-xs text-gray-400 font-bold">units</span>
                        </p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Status</p>
                        <p className="text-xs font-black text-gray-900 uppercase leading-snug">{equipment.status?.replace("_", " ")}</p>
                    </div>
                </div>

                <div className="mt-auto">
                    <button
                        disabled={isOutOfStock}
                        onClick={onBook}
                        className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isOutOfStock
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-95"}`}
                    >
                        {isOutOfStock ? "Unavailable" : "Book Now →"}
                    </button>
                    {!isOutOfStock && (
                        <p className="text-[10px] text-center text-gray-400 mt-2.5 font-semibold">Pick up from the Sports Department</p>
                    )}
                </div>
            </div>
        </div>
    );
}
