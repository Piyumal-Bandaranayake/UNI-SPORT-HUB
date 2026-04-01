"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const MENU_ITEMS = [
    { id: "Overview", icon: "📊", label: "Dashboard" },
    { id: "Explore", icon: "🔍", label: "Explore Sports" },
    { id: "Bookings", icon: "🏸", label: "Bookings" },
    { id: "Applications", icon: "📝", label: "My Applications" },
];

const APPROVED_MENU_ITEMS = [
    { id: "Exercise", icon: "💪", label: "Exercise Plan" },
    { id: "Diet", icon: "🥗", label: "Meal Plan" },
];

const SETTINGS_MENU_ITEM = { id: "Settings", icon: "⚙️", label: "Settings" };

export default function StudentDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("Overview");
    const [sports, setSports] = useState([]);
    const [joinedSports, setJoinedSports] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [trainingSchedules, setTrainingSchedules] = useState([]);
    const [exerciseRequests, setExerciseRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
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
    const [errors, setErrors] = useState({});

    const validateExerciseField = (name, value) => {
        let error = "";
        if (name === "contactNumber") {
            if (!value) error = "Contact number is required.";
            else if (!/^\+?[0-9\s-]{8,15}$/.test(value)) error = "Invalid phone number format (8-15 digits).";
        }
        if (name === "freeTime") {
            if (!value) error = "Free time is required.";
            else if (value.length < 5) error = "Please provide more details (e.g. Day and Time).";
        }
        if (name === "coachId" && !value) error = "Please select a coach.";
        if (name === "sessionType" && !value) error = "Please select a session type.";
        
        setErrors(prev => ({ ...prev, [name]: error }));
        return error === "";
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/student/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const validateJoinField = (name, value) => {
        let error = "";
        if (name === "details") {
            if (!value) error = "Details are required.";
            else if (value.length < 10) error = "Please provide at least 10 characters about your interest.";
        }
        if (name === "sportId" && !value) error = "Please select a sport.";
        
        setErrors(prev => ({ ...prev, [name]: error }));
        return error === "";
    };

    useEffect(() => {
        setErrors({}); // Clear errors when switching tabs
    }, [activeTab]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responses = await Promise.all([
                    fetch("/api/sports"),
                    fetch("/api/student/me"),
                    fetch("/api/student/coaches"),
                    fetch("/api/student/bookings"),
                    fetch("/api/student/training-schedules"),
                    fetch("/api/student/notifications")
                ]);
                const [sportsRes, meRes, coachesRes, bookingsRes, schedulesRes] = responses;
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
                if (schedulesRes.ok) {
                    const schedulesData = await schedulesRes.json();
                    setTrainingSchedules(schedulesData || []);
                }
                const notificationsRes = responses[5];
                if (notificationsRes && notificationsRes.ok) {
                    const notifyData = await notificationsRes.json();
                    setNotifications(notifyData);
                }
                const exerciseRequestsRes = await fetch("/api/student/schedule-exercise");
                if (exerciseRequestsRes.ok) {
                    const exerciseRequestsData = await exerciseRequestsRes.json();
                    setExerciseRequests(exerciseRequestsData || []);
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
        
        let isValid = true;
        isValid = validateJoinField("sportId", formData.sportId) && isValid;
        isValid = validateJoinField("details", formData.details) && isValid;
        
        if (!isValid) return;

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
                setErrors({ ...errors, submit: data.error || "Failed to submit request" });
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

        let isValid = true;
        isValid = validateExerciseField("contactNumber", exerciseFormData.contactNumber) && isValid;
        isValid = validateExerciseField("coachId", exerciseFormData.coachId) && isValid;
        isValid = validateExerciseField("freeTime", exerciseFormData.freeTime) && isValid;
        isValid = validateExerciseField("sessionType", exerciseFormData.sessionType) && isValid;

        if (!isValid) return;

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
                // Refresh exercise requests
                const reqRes = await fetch("/api/student/schedule-exercise");
                if (reqRes.ok) {
                    const reqData = await reqRes.json();
                    setExerciseRequests(reqData);
                }
                setActiveTab("Exercise");
            } else {
                const data = await res.json();
                setErrors({ ...errors, scheduleSubmit: data.error || "Failed to schedule exercise" });
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred");
        } finally {
            setIsScheduling(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        
        try {
            const res = await fetch(`/api/student/bookings/${bookingId}`, {
                method: "DELETE"
            });
            
            if (res.ok) {
                alert("Booking canceled successfully!");
                // Refresh bookings list
                const bookingsRes = await fetch("/api/student/bookings");
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json();
                    setBookings(bookingsData);
                }
            } else {
                const data = await res.json();
                alert(data.error || "Failed to cancel booking");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while canceling the booking.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]" suppressHydrationWarning>
            {/* Sidebar */}
            <aside className="w-64 bg-sky-50 border-r border-sky-100 flex flex-col fixed inset-y-0 left-0 z-40">
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
                        <>
                            <div className="mt-8 mb-4">
                                <h4 className="text-[10px] font-black tracking-widest text-gray-400 uppercase px-4">Athlete Hub</h4>
                            </div>
                            {APPROVED_MENU_ITEMS.map((item) => (
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
                        </>
                    )}

                    <div className="mt-2">
                        <button
                            onClick={() => setActiveTab(SETTINGS_MENU_ITEM.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === SETTINGS_MENU_ITEM.id
                                ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <span className="text-lg">{SETTINGS_MENU_ITEM.icon}</span>
                            {SETTINGS_MENU_ITEM.label}
                        </button>
                    </div>

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
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-sky-100 bg-white/50 backdrop-blur-md space-y-3">
                    <Link
                        href="/"
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-indigo-900/60 hover:bg-sky-100/50 hover:text-indigo-900 transition-all"
                    >
                        <span className="text-base text-indigo-600/50">🏠</span>
                        Back to Home
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
                    >
                        <span className="text-base">🚪</span>
                        Logout
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
                        <button 
                            onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                            className="text-gray-400 hover:text-gray-900 transition-colors relative"
                        >
                            🔔
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        
                        {/* Notification Panel */}
                        {isNotificationPanelOpen && (
                            <div className="absolute top-20 right-0 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Notifications</h4>
                                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full uppercase">{notifications.length} New</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <div className="text-2xl mb-2">🎈</div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No new updates</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className="p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{notif.type.replace('_', ' ')}</span>
                                                    <span className="text-[9px] font-bold text-gray-300 uppercase">{new Date(notif.time).toLocaleDateString()}</span>
                                                </div>
                                                <h5 className="text-[11px] font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{notif.title}</h5>
                                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">"{notif.message}"</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
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
                                                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 mb-3"
                                                    >
                                                        Show QR Code
                                                    </button>
                                                )}

                                                {(booking.status === "PENDING" || booking.status === "ACTIVE") && (
                                                    <button 
                                                        onClick={() => handleCancelBooking(booking._id)}
                                                        className="w-full bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                                                    >
                                                        Cancel Booking
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

                    {activeTab === "Exercise" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                            <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl">🏆</div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">UPCOMING SESSIONS</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Live Timeline • Updated Weekly</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab("Schedule Exercise")}
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100/50"
                                    >
                                        Schedule Consultation
                                    </button>
                                </div>
                                <div className="space-y-5">
                                    {trainingSchedules.length === 0 ? (
                                        <div className="py-24 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-6">
                                            <div className="text-6xl grayscale opacity-30">🏟️</div>
                                            <div className="max-w-xs">
                                                <h4 className="text-lg font-black text-gray-900 tracking-tight mb-2">No Sessions Assigned</h4>
                                                <p className="text-xs text-gray-400 font-medium leading-relaxed">Your professional team training times and workout schedules from coaches will appear here.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        trainingSchedules.map((item, idx) => (
                                            <div key={idx} className={`flex items-center justify-between p-7 rounded-[32px] border transition-all bg-gray-50 border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/20 group`}>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-[20px] bg-white shadow-sm border border-gray-50 flex flex-col items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-105">
                                                        <span className="text-[10px] uppercase opacity-60 leading-none mb-1.5">{item.date.split('-')[2] || "DAY"}</span>
                                                        <span className="text-lg leading-none">{item.date.split('-')[1] || "—"}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight mb-1">{item.activity}</div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50/50 px-2 py-0.5 rounded-full border border-indigo-100/50 uppercase tracking-widest">{item.sportName}</span>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                                                <span>🕒</span>
                                                                {item.time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right hidden md:block">
                                                    <div className="text-xs font-black text-gray-900 underline decoration-indigo-200 underline-offset-4 mb-1">{item.location}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                                                       <span>📍</span> Venue
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                             </section>
 
                             <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100">
                                 <div className="flex items-center gap-4 mb-10">
                                     <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-xl">🤝</div>
                                     <div>
                                         <h3 className="text-2xl font-black text-gray-900 tracking-tight">COACHING SESSIONS</h3>
                                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Requested & Approved consultations</p>
                                     </div>
                                 </div>
 
                                 <div className="space-y-4">
                                     {exerciseRequests.length === 0 ? (
                                         <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                                             <div className="text-4xl opacity-20">📅</div>
                                             <p className="text-xs text-gray-400 font-medium">No personal sessions requested yet.</p>
                                         </div>
                                     ) : (
                                         exerciseRequests.map((req, idx) => (
                                             <div key={req._id || idx} className="flex items-center justify-between p-6 rounded-[28px] bg-gray-50/50 border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                                                 <div className="flex items-center gap-5">
                                                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ${
                                                         req.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 
                                                         req.status === 'REJECTED' ? 'bg-rose-600 text-white' : 
                                                         'bg-indigo-600 text-white'
                                                     }`}>
                                                         {req.sessionType === 'ONLINE' ? '💻' : '🏃'}
                                                     </div>
                                                     <div>
                                                         <div className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">
                                                             Consultation with {req.coachId?.name || "Coach"}
                                                         </div>
                                                         <div className="flex items-center gap-3 mt-1.5">
                                                             <span className="text-[9px] font-black uppercase text-gray-400">🕒 {req.freeTime}</span>
                                                             <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                             <span className={`text-[9px] font-black uppercase ${
                                                                 req.status === 'APPROVED' ? 'text-emerald-500' : 
                                                                 req.status === 'REJECTED' ? 'text-rose-500' : 
                                                                 'text-amber-500'
                                                             }`}>{req.status}</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Session Type</div>
                                                     <div className="text-[10px] font-bold text-gray-900 bg-white px-3 py-1 rounded-full border border-gray-100">{req.sessionType}</div>
                                                 </div>
                                             </div>
                                         ))
                                     )}
                                 </div>
                             </section>
                         </div>
                    )}

                    {activeTab === "Schedule Exercise" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">📅</div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">Schedule Session</h3>
                                        <p className="text-gray-400 text-sm font-medium">Book a guided session with your team coach.</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveTab("Exercise")} className="text-indigo-600 font-bold text-xs hover:underline">← Back to Plan</button>
                            </div>

                            <form onSubmit={handleScheduleExercise} className="space-y-6">
                                {errors.scheduleSubmit && <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in fade-in">{errors.scheduleSubmit}</div>}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div>
                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Student Name</label>
                                         <input type="text" value={session?.user?.name || ""} disabled className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-400 outline-none cursor-not-allowed" />
                                     </div>
                                     <div>
                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Contact Number</label>
                                         <input 
                                             type="tel" placeholder="e.g. +1 234 567 890" 
                                             value={exerciseFormData.contactNumber} 
                                             onChange={(e) => {
                                                 setExerciseFormData({...exerciseFormData, contactNumber: e.target.value});
                                                 validateExerciseField("contactNumber", e.target.value);
                                             }} 
                                             className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 transition-all ${errors.contactNumber ? "ring-2 ring-rose-500" : "ring-indigo-50"}`} 
                                         />
                                         {errors.contactNumber && <p className="mt-2 text-[10px] font-bold text-rose-500 animate-in slide-in-from-top-1">{errors.contactNumber}</p>}
                                     </div>
                                 </div>
 
                                 <div>
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Coach</label>
                                     <select 
                                         value={exerciseFormData.coachId} 
                                         onChange={(e) => {
                                             setExerciseFormData({...exerciseFormData, coachId: e.target.value});
                                             validateExerciseField("coachId", e.target.value);
                                         }} 
                                         className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 transition-all ${errors.coachId ? "ring-2 ring-rose-500" : "ring-indigo-50"}`}
                                     >
                                         <option value="" disabled>Choose a coach...</option>
                                         {coaches.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                     </select>
                                     {errors.coachId && <p className="mt-2 text-[10px] font-bold text-rose-500 animate-in slide-in-from-top-1">{errors.coachId}</p>}
                                 </div>
 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div>
                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Preferred Free Time</label>
                                         <input 
                                             type="text" placeholder="e.g. Wednesday 4:00 PM" 
                                             value={exerciseFormData.freeTime} 
                                             onChange={(e) => {
                                                 setExerciseFormData({...exerciseFormData, freeTime: e.target.value});
                                                 validateExerciseField("freeTime", e.target.value);
                                             }} 
                                             className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 transition-all ${errors.freeTime ? "ring-2 ring-rose-500" : "ring-indigo-50"}`} 
                                         />
                                         {errors.freeTime && <p className="mt-2 text-[10px] font-bold text-rose-500 animate-in slide-in-from-top-1">{errors.freeTime}</p>}
                                     </div>
                                     <div>
                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Session Type</label>
                                         <select 
                                             value={exerciseFormData.sessionType} 
                                             onChange={(e) => {
                                                 setExerciseFormData({...exerciseFormData, sessionType: e.target.value});
                                                 validateExerciseField("sessionType", e.target.value);
                                             }} 
                                             className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 transition-all ${errors.sessionType ? "ring-2 ring-rose-500" : "ring-indigo-50"}`}
                                         >
                                             <option value="" disabled>Select type...</option>
                                             <option value="ONLINE">Online Session</option>
                                             <option value="PHYSICAL">Physical Training</option>
                                         </select>
                                         {errors.sessionType && <p className="mt-2 text-[10px] font-bold text-rose-500 animate-in slide-in-from-top-1">{errors.sessionType}</p>}
                                     </div>
                                 </div>
 
                                 <button disabled={isScheduling || Object.values(errors).some(e => e)} type="submit" className="w-full bg-indigo-600 text-white py-4 mt-4 rounded-2xl font-bold text-sm tracking-tight hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100">
                                     {isScheduling ? "Submitting..." : "Send Request to Coach"}
                                 </button>
                             </form>
                        </div>
                    )}

                    {activeTab === "Diet" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <section className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">NUTRITION PLAN</h3>
                                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Bulking Season</span>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {[
                                            { meal: "Breakfast", items: "Oatmeal with berries, 3 Egg Whites", time: "08:00 AM", cal: "450" },
                                            { meal: "Lunch", items: "Grilled Chicken Breast, Quinoa, Salad", time: "01:00 PM", cal: "650" },
                                            { meal: "Pre-Workout", items: "Banana and Greek Yogurt", time: "04:30 PM", cal: "220" },
                                            { meal: "Dinner", items: "Steamed Fish, Sweet Potato, Broccoli", time: "08:00 PM", cal: "510" },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all">
                                                <div>
                                                    <div className="text-[10px] font-black text-emerald-600 uppercase mb-1">{item.meal} • {item.time}</div>
                                                    <div className="text-sm font-bold text-gray-900">{item.items}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-gray-900">{item.cal}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">KCAL</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="space-y-8">
                                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest">Hydration Tracker</h4>
                                            <div className="flex items-end justify-center gap-2 mb-6">
                                                <div className="text-5xl font-black text-sky-600">2.4</div>
                                                <div className="text-xs font-black text-gray-300 mb-2 uppercase">Liters / 3.5L</div>
                                            </div>
                                            <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden mb-8">
                                                <div className="bg-sky-500 h-full w-[68%]"></div>
                                            </div>
                                            <button className="w-full py-4 bg-sky-50 text-sky-600 rounded-2xl text-[10px] font-black uppercase hover:bg-sky-100 transition-all border border-sky-100">Add 250ml</button>
                                        </div>
                                    </section>

                                    <section className="bg-emerald-600 text-white p-8 rounded-[32px] shadow-xl">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-4">Daily Balance</h4>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <div className="text-lg font-black">180g</div>
                                                <div className="text-[8px] font-bold uppercase text-emerald-200">Protein</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-black">240g</div>
                                                <div className="text-[8px] font-bold uppercase text-emerald-200">Carbs</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-black">65g</div>
                                                <div className="text-[8px] font-bold uppercase text-emerald-200">Fats</div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
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
                            {errors.submit && <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in fade-in">{errors.submit}</div>}
                            
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Sport</label>
                                <select 
                                    value={formData.sportId} 
                                    onChange={(e) => {
                                        setFormData({...formData, sportId: e.target.value});
                                        validateJoinField("sportId", e.target.value);
                                    }}
                                    className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 transition-all ${errors.sportId ? "ring-2 ring-rose-500" : "ring-indigo-50"}`}
                                >
                                    <option value="" disabled>Select a sport...</option>
                                    {sports.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
                                </select>
                                {errors.sportId && <p className="mt-2 text-[10px] font-bold text-rose-500 animate-in slide-in-from-top-1">{errors.sportId}</p>}
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
                                    placeholder="Why do you want to join?"
                                    value={formData.details} 
                                    onChange={(e) => {
                                        setFormData({...formData, details: e.target.value});
                                        validateJoinField("details", e.target.value);
                                    }}
                                    className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-medium text-gray-900 outline-none focus:ring-2 transition-all min-h-[100px] resize-none ${errors.details ? "ring-2 ring-rose-500" : "ring-indigo-50"}`}
                                ></textarea>
                                {errors.details && <p className="mt-2 text-[10px] font-bold text-rose-500 animate-in slide-in-from-top-1">{errors.details}</p>}
                            </div>
                            <button disabled={isSubmitting || Object.values(errors).some(e => e)} type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50">
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
