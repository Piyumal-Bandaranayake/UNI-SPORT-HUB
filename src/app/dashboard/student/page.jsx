"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const MENU_ITEMS = [
    { id: "Overview", icon: "📊", label: "Dashboard" },
    { id: "Explore", icon: "🔍", label: "Explore Sports" },
    { id: "Bookings", icon: "🏸", label: "Bookings" },
    { id: "Applications", icon: "📝", label: "My Applications" },
    { id: "Settings", icon: "⚙️", label: "Settings" },
];

export default function StudentDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("Overview");
    const [sports, setSports] = useState([]);
    const [joinedSports, setJoinedSports] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [isPending, startTransition] = useTransition();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [formData, setFormData] = useState({ sportId: "", details: "" });
    const [exerciseFormData, setExerciseFormData] = useState({
        coachId: "",
        contactNumber: "",
        freeTime: "",
        sessionType: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sportsRes, meRes, coachesRes, bookingsRes] = await Promise.all([
                    fetch("/api/sports"),
                    fetch("/api/student/me"),
                    fetch("/api/student/coaches"),
                    fetch("/api/student/bookings")
                ]);
                if (sportsRes.ok) {
                    const data = await sportsRes.json();
                    setSports(data);
                }
                if (meRes.ok) {
                    const meData = await meRes.json();
                    setJoinedSports(meData.populatedApprovedSports || []);
                }
                if (coachesRes.ok) {
                    const coachesData = await coachesRes.json();
                    setCoaches(coachesData);
                }
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json();
                    setBookings(bookingsData);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            }
        };
        if (session) fetchData();
    }, [session]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, certificates: [reader.result] });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleJoinSport = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/student/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Request submitted successfully!");
                setIsModalOpen(false);
                setFormData({ sportId: "", details: "" });
            } else {
                const data = await res.json();
                alert(data.error || "Failed to submit request");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScheduleExercise = async (e) => {
        e.preventDefault();
        setIsScheduling(true);
        try {
            const res = await fetch("/api/student/schedule-exercise", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(exerciseFormData)
            });
            if (res.ok) {
                alert("Exercise session scheduled successfully! Waiting for coach approval.");
                setExerciseFormData({ coachId: "", contactNumber: "", freeTime: "", sessionType: "" });
            } else {
                const data = await res.json();
                alert(data.error || "Failed to schedule exercise");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred");
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]" suppressHydrationWarning>
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-40">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tighter text-gray-900">
                            Uni<span className="text-indigo-600">Sport</span>Hub
                        </span>
                    </Link>
                </div>

                <div className="px-6 space-y-2 flex-1 overflow-y-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-2xl transition-all group mb-8"
                    >
                        <span className="font-bold text-sm">Join New Sport</span>
                        <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-lg leading-none transition-transform group-hover:rotate-90">＋</span>
                    </button>

                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                                ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                    {joinedSports.length > 0 && (
                        <div className="pt-6 mt-6 border-t border-gray-100 pb-10">
                            <h4 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4 px-4">My Teams</h4>
                            <div className="space-y-1">
                                {joinedSports.map(sport => (
                                    <div key={sport._id} className="flex items-center gap-3 px-4 py-2 opacity-80 hover:opacity-100">
                                        <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                                            {sport.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{sport.name}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-gray-100 space-y-2">
                                <h4 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4 px-4">Training & Diet</h4>
                                <button
                                    onClick={() => setActiveTab("Schedule Exercise")}
                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === "Schedule Exercise"
                                        ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <span className="text-lg">🏋️</span>
                                    Schedule Exercise
                                </button>
                                <button
                                    onClick={() => setActiveTab("Schedule Meal Plan")}
                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === "Schedule Meal Plan"
                                        ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <span className="text-lg">🥗</span>
                                    Schedule Meal Plan
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-50 space-y-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
                    >
                        <span className="text-lg">🚪</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Top Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">{activeTab}</h1>
                        <p className="text-xs text-gray-400 font-medium mt-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="text-gray-400 hover:text-gray-900 transition-colors">✉️</button>
                        <button className="text-gray-400 hover:text-gray-900 transition-colors relative">
                            🔔
                            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600">
                                {session?.user?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">{session?.user?.name}</div>
                                <div className="text-[10px] text-gray-400 font-medium">Student</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Greeting Banner */}
                {activeTab === "Overview" && (
                    <div className="relative mb-10 overflow-hidden rounded-[32px] bg-indigo-600 p-10 shadow-2xl shadow-indigo-100">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="max-w-md">
                                <h2 className="text-4xl font-black text-white leading-tight">
                                    Welcome, {session?.user?.name?.split(' ')[0]}!
                                </h2>
                                <p className="mt-4 text-indigo-100 font-medium">
                                    Ready for your next challenge? Check your active sports, book equipment, or explore new departments.
                                </p>
                            </div>
                            <div className="hidden lg:block relative">
                                <div className="w-56 h-40 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center">
                                    <span className="text-6xl">🏅</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Content */}
                <div className="space-y-10">
                    {activeTab === "Overview" && (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <StatCard label="Active Sports" value={joinedSports.length} color="text-indigo-700" bg="bg-[#EEF2FF]" icon="⚽" subText="Your sports" />
                                <StatCard label="Applications" value="0" color="text-amber-700" bg="bg-[#FFF4E5]" icon="📝" subText="Pending review" />
                                <StatCard 
                                    label="Equipment" 
                                    value={bookings.filter(b => b.status === "ACTIVE" || b.status === "PENDING").length} 
                                    color="text-rose-700" 
                                    bg="bg-[#FFF1F2]" 
                                    icon="🏸" 
                                    subText="Booked items" 
                                    onClick={() => setActiveTab("Bookings")}
                                    clickable
                                />
                            </div>

                            {joinedSports.length > 0 && (
                                <div className="mt-12">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-lg font-black text-gray-900">My Active Teams</h3>
                                    </div>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        {joinedSports.map((sport) => (
                                            <div
                                                key={sport._id}
                                                className="bg-indigo-50 p-6 rounded-[28px] border border-indigo-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0 flex items-center justify-center">
                                                        {sport.image ? (
                                                            <img src={sport.image} alt={sport.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-indigo-600 font-black text-xl">{sport.name.substring(0, 2).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 uppercase tracking-tight">{sport.name}</h4>
                                                        <p className="text-[10px] font-black tracking-widest text-indigo-500 uppercase mt-1">Joined Member</p>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold group-hover:scale-110 transition-transform">
                                                    ✅
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-12">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black text-gray-900">Explore New Sports</h3>
                                    <Link href="/" className="text-indigo-600 text-xs font-bold hover:underline">View All</Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {sports.slice(0, 4).map((sport) => (
                                        <Link
                                            key={sport.id || sport._id}
                                            href={`/sports/${sport.id || sport._id}`}
                                            className="bg-white p-6 rounded-[28px] flex items-center justify-between shadow-sm border border-gray-50 group hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {sport.image ? (
                                                        <img src={sport.image} alt={sport.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-indigo-200 font-black text-xl bg-indigo-50">
                                                            {sport.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{sport.name}</h4>
                                                    <p className="text-xs text-gray-400 mt-1">Join the team today</p>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                →
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "Bookings" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">My Equipment Rentals</h3>
                                    <p className="text-gray-400 text-sm font-medium">Track your active bookings and access QR codes for collection/return.</p>
                                </div>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-gray-100">
                                    <div className="text-6xl mb-6">📦</div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">No Bookings Yet</h3>
                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">Explore university sports and book equipment to see them here.</p>
                                    <button onClick={() => setActiveTab("Explore")} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm tracking-tight hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                        Browse Sports
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {bookings.map((booking) => (
                                        <div key={booking._id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/30 transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                            
                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                    {booking.equipmentName.toLowerCase().includes("ball") ? "⚽" : "🏸"}
                                                </div>
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                                                    booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    booking.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-gray-50 text-gray-400 border-gray-100'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="relative z-10">
                                                <h4 className="text-2xl font-black text-gray-900 mb-1 leading-tight uppercase tracking-tight">{booking.equipmentName}</h4>
                                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-8">{booking.sportName}</p>
                                                
                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Quantity</div>
                                                        <div className="text-lg font-black text-gray-900">{booking.quantity} Units</div>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Date</div>
                                                        <div className="text-sm font-black text-gray-900">{new Date(booking.bookingDate).toLocaleDateString()}</div>
                                                    </div>
                                                </div>

                                                {booking.qrCode && (
                                                    <button 
                                                        onClick={() => setSelectedBooking(booking)}
                                                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                                                    >
                                                        Show QR Code
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Explore" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sports.map((sport) => (
                                <Link
                                    key={sport.id || sport._id}
                                    href={`/sports/${sport.id || sport._id}`}
                                    className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
                                >
                                    <div className="h-48 overflow-hidden relative">
                                        {sport.image ? (
                                            <img src={sport.image} alt={sport.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-200 text-3xl font-black">
                                                {sport.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-white/50">Available</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">{sport.name}</h3>
                                        <p className="text-gray-500 text-xs mb-6 line-clamp-2">
                                            {sport.description || "Join the university department for professional training and competitions."}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Apply Now</span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">→</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {activeTab === "Applications" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6">📝</div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">No Applications Yet</h3>
                            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">Explore university sports and join a team to start your journey.</p>
                            <button onClick={() => setActiveTab("Explore")} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-sm tracking-tight hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                Explore Sports
                            </button>
                        </div>
                    )}

                    {activeTab === "Schedule Exercise" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 max-w-2xl mx-auto">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">🏋️</div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Schedule Exercise</h3>
                                    <p className="text-gray-400 text-sm font-medium">Book a guided session with your team coach.</p>
                                </div>
                            </div>

                            <form onSubmit={handleScheduleExercise} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Student Name</label>
                                        <input type="text" value={session?.user?.name || ""} disabled className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-400 outline-none cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Contact Number</label>
                                        <input required type="tel" placeholder="e.g. +1 234 567 890" value={exerciseFormData.contactNumber} onChange={(e) => setExerciseFormData({...exerciseFormData, contactNumber: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-indigo-50" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Coach</label>
                                    <select required value={exerciseFormData.coachId} onChange={(e) => setExerciseFormData({...exerciseFormData, coachId: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-indigo-50">
                                        <option value="" disabled>Choose a coach...</option>
                                        {coaches.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Preferred Free Time</label>
                                        <input required type="text" placeholder="e.g. Wednesday 4:00 PM" value={exerciseFormData.freeTime} onChange={(e) => setExerciseFormData({...exerciseFormData, freeTime: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-indigo-50" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Session Type</label>
                                        <select required value={exerciseFormData.sessionType} onChange={(e) => setExerciseFormData({...exerciseFormData, sessionType: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-indigo-50">
                                            <option value="" disabled>Select type...</option>
                                            <option value="ONLINE">Online Session</option>
                                            <option value="PHYSICAL">Physical Training</option>
                                        </select>
                                    </div>
                                </div>

                                <button disabled={isScheduling} type="submit" className="w-full bg-indigo-600 text-white py-4 mt-4 rounded-2xl font-bold text-sm tracking-tight hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100">
                                    {isScheduling ? "Submitting..." : "Send Request to Coach"}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "Schedule Meal Plan" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6">🥗</div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Schedule Meal Plan</h3>
                            <p className="text-gray-400 text-sm mb-8 max-sm mx-auto">Your dietary guidelines and meal plans tailored to your sport will be accessible here.</p>
                        </div>
                    )}

                    {activeTab === "Settings" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-6">Profile Settings</h3>
                            <div className="space-y-6 max-w-md">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                                    <input type="text" defaultValue={session?.user?.name} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-indigo-50" readOnly />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                                    <input type="email" defaultValue={session?.user?.email} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-400 outline-none cursor-not-allowed" readOnly />
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all">Save Changes</button>
                                    <button onClick={() => signOut()} className="px-6 py-4 rounded-2xl font-bold text-sm text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all">Sign Out</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal for Joining Sport */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-900">Join a Team</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleJoinSport} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Sport</label>
                                <select 
                                    required 
                                    value={formData.sportId} 
                                    onChange={(e) => setFormData({...formData, sportId: e.target.value})}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-indigo-50"
                                >
                                    <option value="" disabled>Select a sport...</option>
                                    {sports.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Upload Qualification</label>
                                <input 
                                    type="file" 
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-indigo-50"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Additional Details</label>
                                <textarea 
                                    required 
                                    placeholder="Why do you want to join?"
                                    value={formData.details} 
                                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-medium text-gray-900 outline-none focus:ring-2 ring-indigo-50 min-h-[100px] resize-none"
                                ></textarea>
                            </div>
                            <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50">
                                {isSubmitting ? "Submitting..." : "Submit Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Booking QR */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm"
                        >
                            ✕
                        </button>
                        
                        <div className="text-center">
                            <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">Identity Hub</div>
                            <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">Booking Verifier</h3>
                            
                            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 inline-block mb-8">
                                <img 
                                    src={selectedBooking.qrCode} 
                                    alt="Booking QR" 
                                    className="w-48 h-48 mx-auto"
                                />
                            </div>
                            
                            <div className="space-y-4 text-left">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Equipment Name</div>
                                    <div className="text-gray-900 font-bold">{selectedBooking.equipmentName}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Booking Reference</div>
                                    <div className="text-[10px] font-mono font-medium text-gray-500 truncate">{selectedBooking._id}</div>
                                </div>
                            </div>
                            
                            <p className="mt-8 text-xs text-gray-400 font-medium">Please present this code to the sports department staff to verify your booking.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color, bg, icon, subText, onClick, clickable }) {
    return (
        <div 
            onClick={onClick}
            className={`rounded-[28px] ${bg} p-7 flex flex-col gap-4 shadow-sm border border-gray-50 transition-all duration-300 ${clickable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl' : 'hover:-translate-y-1'}`}
        >
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl transition-transform group-hover:scale-110">{icon}</div>
                <div className={`text-3xl font-black ${color}`}>{value}</div>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
                <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase leading-none">{subText}</p>
            </div>
        </div>
    );
}
