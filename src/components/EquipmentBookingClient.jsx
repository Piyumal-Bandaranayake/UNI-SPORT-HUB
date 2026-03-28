"use client";

import { useState } from "react";
import Image from "next/image";

export default function EquipmentBookingClient({ equipments, user }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isBooking, setIsBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [error, setError] = useState("");

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

        if (!user) {
            setError("Please login first to book equipment.");
            setIsBooking(false);
            return;
        }

        // Frontend validation for phone number
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError("Please enter a valid phone number (at least 10 digits).");
            setIsBooking(false);
            return;
        }

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    equipmentId: selectedItem._id,
                    quantity: quantity,
                    phoneNumber: phoneNumber
                })
            });

            const data = await res.json();
            if (res.ok) {
                setBookingResult(data);
                // Refresh equipments availability locally (optional, but good for UI)
                selectedItem.available -= quantity;
            } else {
                setError(data.error || "An error occurred");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-16">
            {equipments.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
                    <div className="text-6xl mb-6">📦</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Equipment Found</h3>
                    <p className="text-gray-500">There are currently no equipment listed for this sport.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {equipments.map((item) => (
                        <EquipmentCard 
                            key={item._id} 
                            equipment={item} 
                            onBook={() => handleOpenBooking(item)} 
                        />
                    ))}
                </div>
            )}

            {/* Booking Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseBooking}></div>
                    <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        {bookingResult ? (
                            <div className="p-10 text-center">
                                <div className="text-4xl mb-6 text-emerald-500 font-black">SUCCESS!</div>
                                <p className="text-gray-500 mb-8 font-medium">Your booking is confirmed. Please show this QR code at the sports facility to collect your equipment.</p>
                                
                                <div className="bg-indigo-50 p-6 rounded-[32px] inline-block mb-8 border border-indigo-100">
                                    <img 
                                        src={bookingResult.qrCode} 
                                        alt="Booking QR Code" 
                                        className="w-48 h-48 mx-auto"
                                    />
                                </div>
                                
                                <button 
                                    onClick={handleCloseBooking}
                                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Book Item</h2>
                                        <p className="text-gray-500 font-medium">Confirm your rental details below</p>
                                    </div>
                                    <button onClick={handleCloseBooking} className="text-gray-400 hover:text-gray-900 text-2xl px-2">✕</button>
                                </div>

                                <form onSubmit={handleBookingSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Equipment</div>
                                            <div className="text-gray-900 font-bold">{selectedItem.name}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Student ID</div>
                                                <div className="text-gray-900 font-bold truncate">{user?.universityId || <span className="text-rose-400 text-[10px] italic">Login Required</span>}</div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Email</div>
                                                <div className="text-gray-900 font-bold truncate">{user?.universityEmail || <span className="text-rose-400 text-[10px] italic">Login Required</span>}</div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white border-2 border-indigo-600/20 rounded-2xl group focus-within:border-indigo-600 transition-all">
                                            <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-1 block">Phone Number</div>
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
                                            <label className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-1 block">Quantity</label>
                                            <div className="flex items-center justify-between">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl hover:bg-indigo-600 hover:text-white transition-all"
                                                >
                                                    -
                                                </button>
                                                <input 
                                                    type="number" 
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(Math.min(selectedItem.available, Math.max(1, parseInt(e.target.value) || 1)))}
                                                    className="bg-transparent border-none text-center font-black text-2xl text-gray-900 w-16 focus:outline-none"
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setQuantity(Math.min(selectedItem.available, quantity + 1))}
                                                    className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl hover:bg-indigo-600 hover:text-white transition-all"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-[10px] text-gray-400 text-center mt-2 font-medium italic">Max Available: {selectedItem.available}</div>
                                        </div>
                                    </div>

                                    {error && <div className="text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</div>}

                                    <button 
                                        type="submit" 
                                        disabled={isBooking}
                                        className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                                    >
                                        {isBooking ? "Confirming..." : "Confirm Booking"}
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

    const getCategoryIcon = (category) => {
        const cat = category.toUpperCase();
        if (cat.includes("BALL")) return "⚽";
        if (cat.includes("RACKET") || cat.includes("BAT") || cat.includes("PADDLE")) return "🏸";
        if (cat.includes("SHOES") || cat.includes("BOOTS") || cat.includes("SPIKES")) return "👟";
        if (cat.includes("CLOTH") || cat.includes("JERSEY") || cat.includes("UNIFORM")) return "👕";
        if (cat.includes("SAFETY") || cat.includes("GUARD") || cat.includes("HELMET")) return "🛡️";
        return "📦";
    };
    
    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 group overflow-hidden flex flex-col">
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden bg-gray-50">
                {equipment.image ? (
                    <img 
                        src={equipment.image} 
                        alt={equipment.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl opacity-10 select-none group-hover:scale-125 transition-transform duration-700 font-medium">
                        {getCategoryIcon(equipment.category)}
                    </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border ${
                        isOutOfStock 
                        ? 'bg-rose-500/80 text-white border-rose-400/30' 
                        : 'bg-emerald-500/80 text-white border-emerald-400/30'
                    }`}>
                        {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </span>
                </div>

                {/* Condition Badge */}
                <div className="absolute top-4 right-4">
                    <span className="bg-white/80 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm border border-white/20">
                        ✨ {equipment.condition}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex-grow flex flex-col">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{getCategoryIcon(equipment.category)}</span>
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-lg inline-block">
                            {equipment.category}
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none pt-1">
                        {equipment.name}
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Available</div>
                        <div className={`text-xl font-black ${equipment.available <= 2 ? 'text-rose-600' : 'text-gray-900'}`}>
                            {equipment.available} <span className="text-xs text-gray-400 uppercase font-bold">Units</span>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</div>
                        <div className="text-xs font-bold text-gray-900 uppercase leading-relaxed pt-1">
                            {equipment.status.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <button 
                        disabled={isOutOfStock}
                        onClick={onBook}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                            isOutOfStock 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'
                        }`}
                    >
                        {isOutOfStock ? "Unavailable" : "Book Item"}
                    </button>
                    {!isOutOfStock && (
                        <p className="text-[10px] text-center text-gray-400 mt-4 font-bold uppercase tracking-widest">
                            * Pick up from Department
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
