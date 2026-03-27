"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";

const MENU_ITEMS = [
    { id: "Overview", icon: "📊", label: "Sport Overview" },
    { id: "Members", icon: "👥", label: "Members" },
    { id: "Events", icon: "📅", label: "Events" },
    { id: "Equipment", icon: "🏸", label: "Equipment" },
    { id: "Coaches", icon: "👨‍🏫", label: "Coaches" },
    { id: "Settings", icon: "⚙️", label: "Settings" },
];

export default function SportManagementDashboard() {
    const { data: session } = useSession();
    const params = useParams();
    const { id } = params;
    
    const [activeTab, setActiveTab] = useState("Overview");
    const [sport, setSport] = useState(null);
    const [coaches, setCoaches] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [memberRequests, setMemberRequests] = useState([]);
    const [roster, setRoster] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingCoaches, setLoadingCoaches] = useState(false);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    
    const [activeMemberTab, setActiveMemberTab] = useState("Pending");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    // Updates State
    const [updateData, setUpdateData] = useState({ name: "", description: "", image: "" });
    const [updateStatus, setUpdateStatus] = useState({ loading: false, uploadLoading: false, error: "", success: "" });

    const [newItem, setNewItem] = useState({ name: "", category: "", quantity: 0, condition: "GOOD" });
    const [newEvent, setNewEvent] = useState({ name: "", date: "", time: "", location: "", type: "TRAINING", description: "", image: "" });

    useEffect(() => {
        const fetchSportDetails = async () => {
            try {
                const res = await fetch("/api/user/assigned-sports");
                if (res.ok) {
                    const data = await res.json();
                    const foundSport = data.find(s => s.id === id);
                    if (foundSport) {
                        setSport(foundSport);
                        setUpdateData({ name: foundSport.name, description: foundSport.description || "", image: foundSport.image || "" });
                        // Fetch all relevant data for this sport
                        fetchCoaches(foundSport.name);
                        fetchInventory(foundSport.id);
                        fetchMembers(foundSport.name);
                        fetchEvents(foundSport.id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch sport details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSportDetails();
    }, [id]);

    const fetchCoaches = async (sportName) => {
        setLoadingCoaches(true);
        try {
            const res = await fetch(`/api/user/sport-coaches?sportName=${encodeURIComponent(sportName)}`);
            if (res.ok) {
                const data = await res.json();
                setCoaches(data);
            }
        } catch (err) {
            console.error("Failed to fetch coaches:", err);
        } finally {
            setLoadingCoaches(false);
        }
    };

    const fetchInventory = async (sportId) => {
        setLoadingInventory(true);
        try {
            const res = await fetch(`/api/user/inventory?sportId=${sportId}`);
            if (res.ok) {
                const data = await res.json();
                setInventory(data);
            }
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
        } finally {
            setLoadingInventory(false);
        }
    };

    const fetchMembers = async (sportName) => {
        setLoadingMembers(true);
        try {
            const [pendingRes, rosterRes] = await Promise.all([
                fetch(`/api/user/sport-members?sportName=${encodeURIComponent(sportName)}&type=pending`),
                fetch(`/api/user/sport-members?sportName=${encodeURIComponent(sportName)}&type=roster`)
            ]);
            
            if (pendingRes.ok) setMemberRequests(await pendingRes.json());
            if (rosterRes.ok) setRoster(await rosterRes.json());
        } catch (err) {
            console.error("Failed to fetch members:", err);
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchEvents = async (sportId) => {
        setLoadingEvents(true);
        try {
            const res = await fetch(`/api/user/sport-events?sportId=${sportId}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
                // Update selected event if open
                if (selectedEvent) {
                    const updated = data.find(e => e._id === selectedEvent._id);
                    if (updated) setSelectedEvent(updated);
                }
            }
        } catch (err) {
            console.error("Failed to fetch events:", err);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/user/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newItem, sportId: sport.id }),
            });
            if (res.ok) {
                const addedItem = await res.json();
                setInventory([addedItem, ...inventory]);
                setShowAddModal(false);
                setNewItem({ name: "", category: "", quantity: 0, condition: "GOOD" });
            }
        } catch (err) {
            console.error("Failed to add item:", err);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!confirm("Are you sure you want to remove this item?")) return;
        try {
            const res = await fetch("/api/user/inventory", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: itemId }),
            });
            if (res.ok) {
                setInventory(inventory.filter(item => item._id !== itemId));
            }
        } catch (err) {
            console.error("Failed to delete item:", err);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 0) return;
        try {
            const res = await fetch("/api/user/inventory", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: itemId, quantity: newQuantity }),
            });
            if (res.ok) {
                const updated = await res.json();
                setInventory(inventory.map(item => item._id === itemId ? updated : item));
            }
        } catch (err) {
            console.error("Failed to update quantity:", err);
        }
    };

    const handleMemberAction = async (studentId, action) => {
        try {
            const res = await fetch("/api/user/sport-members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, sportName: sport.name, action }),
            });
            if (res.ok) {
                fetchMembers(sport.name);
            }
        } catch (err) {
            console.error("Failed to handle member action:", err);
        }
    };

    const uploadToCloudinary = async (base64Image, folder = "unisporthub") => {
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image, folder }),
            });
            const data = await res.json();
            if (res.ok) return data.url;
            throw new Error(data.error || "Upload failed");
        } catch (err) {
            console.error("Cloudinary upload tool error:", err);
            throw err;
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        setUpdateStatus({ ...updateStatus, uploadLoading: true, error: "", success: "" });
        
        try {
            let imageUrl = newEvent.image;
            
            // If image is a base64 string, upload it to Cloudinary first
            if (imageUrl && imageUrl.startsWith("data:image")) {
                imageUrl = await uploadToCloudinary(imageUrl, `events/${sport.name}`);
            }

            const res = await fetch("/api/user/sport-events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newEvent, image: imageUrl, sportId: sport.id }),
            });
            
            if (res.ok) {
                fetchEvents(sport.id);
                setShowAddEventModal(false);
                setNewEvent({ name: "", date: "", time: "", location: "", type: "TRAINING", description: "", image: "" });
                setUpdateStatus({ ...updateStatus, uploadLoading: false, success: "Event published successfully!" });
            } else {
                const errorData = await res.json();
                setUpdateStatus({ ...updateStatus, uploadLoading: false, error: errorData.error || "Failed to create event." });
            }
        } catch (err) {
            console.error("Failed to add event:", err);
            setUpdateStatus({ ...updateStatus, uploadLoading: false, error: "Image upload failed. Please try again." });
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm("Remove this event?")) return;
        try {
            const res = await fetch("/api/user/sport-events", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: eventId }),
            });
            if (res.ok) {
                setEvents(events.filter(e => e._id !== eventId));
            }
        } catch (err) {
            console.error("Failed to delete event:", err);
        }
    };

    const handleToggleParticipant = async (studentId) => {
        if (!selectedEvent) return;
        
        const isParticipant = selectedEvent.participants.some(p => p._id === studentId || p === studentId);
        let newParticipants;
        
        if (isParticipant) {
            newParticipants = selectedEvent.participants.filter(p => (p._id || p) !== studentId);
        } else {
            newParticipants = [...selectedEvent.participants.map(p => p._id || p), studentId];
        }

        try {
            const res = await fetch("/api/user/sport-events", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedEvent._id, participants: newParticipants }),
            });
            if (res.ok) {
                fetchEvents(sport.id);
            }
        } catch (err) {
            console.error("Failed to update participants:", err);
        }
    };

    const handleUpdateSport = async (e) => {
        e.preventDefault();
        setUpdateStatus({ loading: true, error: "", success: "" });

        if (updateData.name.trim().length < 3) {
            setUpdateStatus({ loading: false, error: "Sport Title must be at least 3 characters long.", success: "" });
            return;
        }

        try {
            let imageUrl = updateData.image;

            // Upload sport identity image if it's new (base64)
            if (imageUrl && imageUrl.startsWith("data:image")) {
                imageUrl = await uploadToCloudinary(imageUrl, `sports/${sport.name}`);
            }

            const res = await fetch("/api/admin/sports", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: sport.id, ...updateData, image: imageUrl }),
            });
            const result = await res.json();

            if (res.ok) {
                setUpdateStatus({ loading: false, uploadLoading: false, error: "", success: "Department details synchronized successfully!" });
                setSport(result.data);
            } else {
                setUpdateStatus({ loading: false, uploadLoading: false, error: result.error || "Failed to update department.", success: "" });
            }
        } catch (err) {
            setUpdateStatus({ loading: false, uploadLoading: false, error: "Connection error or image upload failed.", success: "" });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    if (!session || session.user.role !== "SUB_ADMIN") {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#F0F2F5] p-4 text-center">
                <h2 className="text-2xl font-black text-gray-900 mb-4">Access Denied</h2>
                <p className="text-gray-500 mb-8 max-w-md">You do not have permission to access this management dashboard.</p>
                <Link href="/login" className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold transition-all">
                    Login with Admin Account
                </Link>
            </div>
        );
    }

    if (!sport) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#F0F2F5] p-4 text-center">
                <h2 className="text-2xl font-black text-gray-900 mb-4">Sport Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-md">The sport you're looking for doesn't exist or isn't assigned to you.</p>
                <Link href="/dashboard/sub-admin" className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold transition-all">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]" suppressHydrationWarning>
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-40">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tighter text-gray-900">
                            Uni<span className="text-sky-600">Sport</span>Hub
                        </span>
                    </Link>
                </div>

                <div className="px-6 space-y-2 flex-1">
                    <div className="bg-sky-50 px-4 py-3 rounded-2xl mb-8 border border-sky-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 block mb-1">Editing Sport</span>
                        <span className="text-sm font-black text-gray-900 truncate block">{sport.name}</span>
                    </div>

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
                            {item.id === "Athletes" ? (sport.name.charAt(0).toUpperCase() + sport.name.slice(1)) : item.label}
                        </button>
                    ))}
                    
                    <div className="pt-8">
                        <Link 
                            href="/dashboard/sub-admin" 
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all"
                        >
                            <span className="text-lg">←</span>
                            Back to Main
                        </Link>
                    </div>
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
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white text-xl font-black">
                            {sport.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{sport.name} Management</h1>
                            <p className="text-xs text-gray-400 font-medium mt-1">Management Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center font-black text-sky-600">
                                {session?.user?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">{session?.user?.name}</div>
                                <div className="text-[10px] text-gray-400 font-medium">Managing {sport.name}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="space-y-10">
                    {activeTab === "Overview" && (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <StatCard label="Active Roster" value={roster.length} color="text-sky-700" bg="bg-[#F0F9FF]" icon="👥" subText="Approved members" />
                                <StatCard label="Assigned Coaches" value={coaches.length} color="text-emerald-700" bg="bg-[#ECFDF5]" icon="👨‍🏫" subText="Department staff" />
                                <StatCard label="Upcoming Events" value={events.filter(e => e.status === "UPCOMING").length} color="text-amber-700" bg="bg-[#FFFBEB]" icon="📅" subText="Next 30 days" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                                <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-6 flex justify-between items-center">
                                        Recent Activity
                                        <button className="text-xs text-sky-600 font-black uppercase hover:underline">View All</button>
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 py-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                            <p className="text-sm text-gray-500 font-medium flex-1">New join request from <span className="text-gray-900 font-bold">John Doe</span></p>
                                            <span className="text-[10px] text-gray-300 font-black uppercase">2m ago</span>
                                        </div>
                                        <div className="flex items-center gap-4 py-2 border-t border-gray-50">
                                            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                                            <p className="text-sm text-gray-500 font-medium flex-1">Training session updated for <span className="text-gray-900 font-bold">Tuesday</span></p>
                                            <span className="text-[10px] text-gray-300 font-black uppercase">1h ago</span>
                                        </div>
                                        <div className="flex items-center gap-4 py-2 border-t border-gray-50">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <p className="text-sm text-gray-500 font-medium flex-1">New equipment added to <span className="text-gray-900 font-bold">Inventory</span></p>
                                            <span className="text-[10px] text-gray-300 font-black uppercase">3h ago</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-6 flex justify-between items-center">
                                        Upcoming Sessions
                                        <button className="text-xs text-sky-600 font-black uppercase hover:underline">Full Calendar</button>
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-gray-900 text-sm">Main Practice Session</h4>
                                                <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full text-sky-600 border border-sky-100">Today</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-black uppercase tracking-tight">
                                                <span>📅 4:00 PM</span>
                                                <span>🏟️ Main Complex</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-gray-900 text-sm">Recovery Session</h4>
                                                <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full text-gray-400 border border-gray-100">Tomorrow</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-black uppercase tracking-tight">
                                                <span>📅 2:00 PM</span>
                                                <span>🏟️ Health Center</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </>
                    )}

                    {activeTab === "Members" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 min-h-[500px]">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 underline decoration-sky-200 underline-offset-8 decoration-4 uppercase tracking-tight">Team Management</h3>
                                    <div className="flex gap-6 mt-6">
                                        <button 
                                            onClick={() => setActiveMemberTab("Pending")}
                                            className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeMemberTab === "Pending" ? "border-sky-600 text-sky-600" : "border-transparent text-gray-400"}`}
                                        >
                                            Pending Requests ({memberRequests.length})
                                        </button>
                                        <button 
                                            onClick={() => setActiveMemberTab("Roster")}
                                            className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeMemberTab === "Roster" ? "border-sky-600 text-sky-600" : "border-transparent text-gray-400"}`}
                                        >
                                            Active Roster ({roster.length})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loadingMembers ? (
                                <div className="py-20 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
                                </div>
                            ) : activeMemberTab === "Pending" ? (
                                <div className="space-y-4">
                                    {memberRequests.length > 0 ? memberRequests.map((req) => (
                                        <div key={req.id} className="p-6 bg-[#FAFBFD] rounded-[28px] border border-gray-50 flex items-center justify-between group hover:border-sky-100 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-sky-600">
                                                    {req.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{req.name}</div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{req.universityId} • {req.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => handleMemberAction(req.id, "approve")}
                                                    className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 shadow-lg shadow-emerald-100"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleMemberAction(req.id, "reject")}
                                                    className="bg-white border border-rose-100 text-rose-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-rose-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20">
                                            <div className="text-4xl mb-4">✨</div>
                                            <p className="text-gray-400 italic font-medium">No pending registration requests.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {roster.length > 0 ? roster.map((member) => (
                                        <div key={member.id} className="p-6 bg-[#FAFBFD] rounded-[28px] border border-gray-50 group hover:border-sky-100 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center font-black text-sky-600 text-xs">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <button 
                                                    onClick={() => handleMemberAction(member.id, "remove")}
                                                    className="text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="font-bold text-gray-900 text-sm mb-1">{member.name}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{member.universityId}</div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 col-span-full">
                                            <div className="text-4xl mb-4">👥</div>
                                            <p className="text-gray-400 italic font-medium">Your team roster is currently empty.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Events" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 min-h-[500px]">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 underline decoration-emerald-200 underline-offset-8 decoration-4 uppercase tracking-tight">Events & Schedules</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-4">Manage matches, training, and tournaments for {sport.name}</p>
                                </div>
                                <button 
                                    onClick={() => setShowAddEventModal(true)}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-sky-600 transition-all shadow-lg shadow-gray-100"
                                >
                                    + Create Event
                                </button>
                            </div>

                            {loadingEvents ? (
                                <div className="py-20 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                                </div>
                            ) : events.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {events.map((event) => (
                                        <div key={event._id} className="bg-white rounded-[32px] border border-gray-50 group hover:border-emerald-100 transition-all relative overflow-hidden flex flex-col h-full shadow-sm">
                                            {event.image ? (
                                                <div className="h-32 w-full overflow-hidden shrink-0">
                                                    <img src={event.image} alt="Event Cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                            ) : (
                                                <div className="h-3 bg-gray-50"></div>
                                            )}

                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all z-10">
                                                    <button 
                                                        onClick={() => handleDeleteEvent(event._id)}
                                                        className="w-8 h-8 rounded-full bg-white/90 text-rose-500 border border-rose-100 flex items-center justify-center text-xs shadow-lg"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>

                                                <div className="flex gap-4 mb-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center border border-gray-50 shrink-0">
                                                        <span className="text-[10px] font-black text-rose-500 uppercase">{new Date(event.date).toLocaleString('en-US', { month: 'short' })}</span>
                                                        <span className="text-lg font-black text-gray-900">{new Date(event.date).getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <div className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase inline-block mb-1 ${
                                                            event.type === "MATCH" ? "bg-rose-50 text-rose-600" :
                                                            event.type === "TOURNAMENT" ? "bg-amber-50 text-amber-600" :
                                                            "bg-sky-50 text-sky-600"
                                                        }`}>
                                                            {event.type}
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 line-clamp-1">{event.name}</h4>
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                                    <span>🕒 {event.time}</span>
                                                    <div className="flex items-center gap-4">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedEvent(event);
                                                                setShowParticipantsModal(true);
                                                            }}
                                                            className="text-emerald-600 hover:sky-600 font-black py-1 px-2 transition-all"
                                                        >
                                                            👥 {event.participants?.length || 0}
                                                        </button>
                                                        <span className={`${
                                                            event.status === "UPCOMING" ? "text-sky-600" :
                                                            event.status === "LIVE" ? "text-emerald-600 animate-pulse" :
                                                            "text-gray-300"
                                                        }`}>{event.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="text-5xl mb-6">📅</div>
                                    <h4 className="font-bold text-gray-400 italic font-medium">No events scheduled.</h4>
                                    <button 
                                        onClick={() => setShowAddEventModal(true)}
                                        className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold text-sm"
                                    >
                                        + Schedule First Activity
                                    </button>
                                </div>
                            )}

                            {/* Participants Modal */}
                            {showParticipantsModal && selectedEvent && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                                    <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                                        <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900">{selectedEvent.name}</h3>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage Attendance</p>
                                            </div>
                                            <button onClick={() => setShowParticipantsModal(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
                                        </div>
                                        
                                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                            {roster.length > 0 ? roster.map((member) => {
                                                const isAttending = selectedEvent.participants.some(p => (p._id || p) === member.id);
                                                return (
                                                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-sky-100 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isAttending ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-white text-gray-400"}`}>
                                                                {member.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 text-sm">{member.name}</div>
                                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{member.universityId}</div>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleToggleParticipant(member.id)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isAttending ? "text-rose-500 hover:bg-rose-50" : "bg-gray-900 text-white hover:bg-sky-600"}`}
                                                        >
                                                            {isAttending ? "Remove" : "Add"}
                                                        </button>
                                                    </div>
                                                );
                                            }) : (
                                                <div className="text-center py-10">
                                                    <p className="text-gray-400 italic font-medium">No roster members available to add.</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mt-8 pt-6 border-t border-gray-50">
                                            <button 
                                                onClick={() => setShowParticipantsModal(false)}
                                                className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-100 transition-all"
                                            >
                                                Done Management
                                            </button>
                                    </div>
                                </div>
                            </div>
                        )}

                             {/* Add Event Modal */}
                             {showAddEventModal && (
                                 <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
                                     <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
                                         <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                             <div>
                                                 <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                                     📅 <span className="underline decoration-sky-200 decoration-4 underline-offset-4">New Scheduling</span>
                                                 </h3>
                                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure Department Event</p>
                                             </div>
                                             <button 
                                                 onClick={() => setShowAddEventModal(false)} 
                                                 className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-gray-100"
                                             >
                                                 ✕
                                             </button>
                                         </div>

                                         <form onSubmit={handleAddEvent} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                                             <div className="space-y-4">
                                                 <div>
                                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Cover Media <span className="text-sky-600 ml-2 italic text-[8px]">(Optional)</span></label>
                                                     <div className="relative h-28 w-full bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group hover:border-sky-300 transition-all cursor-pointer">
                                                         {newEvent.image ? (
                                                             <div className="relative w-full h-full group">
                                                                 <img src={newEvent.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="Preview" />
                                                                 <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Image</span>
                                                                 </div>
                                                             </div>
                                                         ) : (
                                                             <div className="text-center">
                                                                 <div className="text-2xl mb-1">🖼️</div>
                                                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Drop Event Banner</span>
                                                             </div>
                                                         )}
                                                         <input 
                                                             type="file" 
                                                             accept="image/*"
                                                             onChange={(e) => {
                                                                 const file = e.target.files[0];
                                                                 if (file) {
                                                                     const reader = new FileReader();
                                                                     reader.onloadend = () => setNewEvent({...newEvent, image: reader.result});
                                                                     reader.readAsDataURL(file);
                                                                 }
                                                             }}
                                                             className="absolute inset-0 opacity-0 cursor-pointer" 
                                                         />
                                                     </div>
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                                                     <div className="col-span-2">
                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Event Identity / Name</label>
                                                         <input 
                                                             type="text" required
                                                             value={newEvent.name}
                                                             onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                                                             className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold text-gray-900 focus:ring-2 ring-sky-50 focus:bg-white outline-none transition-all" 
                                                             placeholder="e.g. Weekly Varsity Training"
                                                         />
                                                     </div>

                                                     <div>
                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date</label>
                                                         <input 
                                                             type="date" required
                                                             value={newEvent.date}
                                                             onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                                             className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold text-gray-900 focus:ring-2 ring-sky-50 focus:bg-white outline-none transition-all" 
                                                         />
                                                     </div>

                                                     <div>
                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Time</label>
                                                         <input 
                                                             type="time" required
                                                             value={newEvent.time}
                                                             onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                                             className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold text-gray-900 focus:ring-2 ring-sky-50 focus:bg-white outline-none transition-all" 
                                                         />
                                                     </div>

                                                     <div className="col-span-2">
                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Venue / Location</label>
                                                         <input 
                                                             type="text" required
                                                             value={newEvent.location}
                                                             onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                                             className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold text-gray-900 focus:ring-2 ring-sky-50 focus:bg-white outline-none transition-all" 
                                                             placeholder="e.g. SLIIT Main Sports Complex"
                                                         />
                                                     </div>

                                                     <div className="col-span-2">
                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Field Instruction / Overview</label>
                                                         <textarea 
                                                             rows={2}
                                                             value={newEvent.description}
                                                             onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                                             className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold text-gray-900 focus:ring-2 ring-sky-50 focus:bg-white outline-none transition-all resize-none" 
                                                             placeholder="Tactical notes, requirements, or meeting points..."
                                                         />
                                                     </div>

                                                     <div className="col-span-2">
                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Selection Category</label>
                                                         <div className="flex gap-2">
                                                             {["TRAINING", "MATCH", "TOURNAMENT", "MEETING"].map((type) => (
                                                                 <button 
                                                                     key={type} type="button"
                                                                     onClick={() => setNewEvent({...newEvent, type})}
                                                                     className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all border ${
                                                                         newEvent.type === type 
                                                                         ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200" 
                                                                         : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                                                                     }`}
                                                                 >
                                                                     {type}
                                                                 </button>
                                                             ))}
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                             
                                             <div className="pt-2">
                                                 <button 
                                                     type="submit"
                                                     disabled={updateStatus.uploadLoading}
                                                     className="w-full bg-sky-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-[0.98] disabled:opacity-50"
                                                 >
                                                     {updateStatus.uploadLoading ? "Uploading Media..." : "Publish Department Event"}
                                                 </button>
                                             </div>
                                         </form>
                                     </div>
                                 </div>
                             )}
                         </div>
                     )}

                     {activeTab === "Equipment" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 min-h-[500px]">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 underline decoration-amber-200 underline-offset-8 decoration-4 uppercase tracking-tight">Gear Inventory</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-4">Manage and track equipment for {sport.name}.</p>
                                </div>
                                <button 
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-gray-100"
                                >
                                    + Add Item
                                </button>
                            </div>

                            {loadingInventory ? (
                                <div className="py-20 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                                </div>
                            ) : inventory.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {inventory.map((item) => (
                                        <div key={item._id} className="p-6 bg-[#FAFBFD] rounded-[32px] border border-gray-50 group hover:border-amber-100 transition-all relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xs"
                                                >
                                                    🗑️
                                                </button>
                                            </div>

                                            <div className="flex gap-4 mb-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-50">
                                                    {item.category === "UNIFORM" ? "👕" : item.category === "SAFETY" ? "🛡️" : "🏸"}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{item.category}</div>
                                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</span>
                                                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                                                    <button 
                                                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                        className="w-6 h-6 rounded-lg bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                                                    >-</button>
                                                    <span className="text-xs font-black text-gray-900 w-4 text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                        className="w-6 h-6 rounded-lg bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all"
                                                    >+</button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/50 p-3 rounded-xl border border-gray-50">
                                                <span>Condition</span>
                                                <span className={`px-2 py-0.5 rounded-md ${
                                                    item.condition === "GOOD" ? "text-emerald-600" :
                                                    item.condition === "WORN" ? "text-amber-600" :
                                                    "text-rose-600"
                                                }`}>{item.condition}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="text-5xl mb-6">🏸</div>
                                    <h4 className="font-bold text-gray-400 italic font-medium">No equipment found.</h4>
                                    <button 
                                        onClick={() => setShowAddModal(true)}
                                        className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold text-sm"
                                    >
                                        + Catalog First Item
                                    </button>
                                </div>
                            )}

                            {/* Add Item Modal */}
                            {showAddModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                                    <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-xl font-black text-gray-900 text-center flex-1 ml-6">Add Equipment</h3>
                                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900">✕</button>
                                        </div>
                                        <form onSubmit={handleAddItem} className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Item Name</label>
                                                <input 
                                                    type="text" required
                                                    value={newItem.name}
                                                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 ring-sky-50 outline-none" 
                                                    placeholder="e.g. Wilson Pro Staff"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
                                                    <select 
                                                        value={newItem.category}
                                                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 ring-sky-50 outline-none"
                                                    >
                                                        <option value="">Select Category</option>
                                                        <option value="EQUIPMENT">Equipment</option>
                                                        <option value="UNIFORM">Uniform</option>
                                                        <option value="SAFETY">Safety Gear</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Initial Stock</label>
                                                    <input 
                                                        type="number" required min="0"
                                                        value={newItem.quantity}
                                                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 ring-sky-50 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                type="submit"
                                                className="w-full bg-sky-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all pt-4"
                                            >
                                                Catalog Item
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Coaches" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 min-h-[500px]">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 underline decoration-sky-200 underline-offset-8 decoration-4 uppercase tracking-tight">Assigned Coaches</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-4">Staff members managing {sport.name} with you.</p>
                                </div>
                            </div>

                            {loadingCoaches ? (
                                <div className="py-20 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
                                </div>
                            ) : coaches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {coaches.map((coach) => (
                                        <div key={coach._id} className="p-6 bg-[#FAFBFD] rounded-[28px] border border-gray-50 group hover:border-sky-100 transition-all">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-sky-600">
                                                    {coach.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{coach.name}</div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Coach</div>
                                                </div>
                                            </div>
                                            <div className="space-y-3 pt-4 border-t border-gray-100/50">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <span>🆔 {coach.universityId}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <span>📧 {coach.universityEmail || coach.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="text-5xl mb-6">👨‍🏫</div>
                                    <p className="text-gray-400 italic font-medium">No coaches have been assigned to this sport yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Settings" && (
                        <div className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                ⚙️ <span className="underline decoration-indigo-200 decoration-4 underline-offset-4">Department Identity</span>
                            </h3>

                            <form onSubmit={handleUpdateSport} className="space-y-8">
                                {updateStatus.error && <p className="p-4 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">{updateStatus.error}</p>}
                                {updateStatus.success && <p className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">{updateStatus.success}</p>}

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Department Identity Image</label>
                                    <div className="relative h-40 w-full bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden group hover:border-indigo-200 transition-all cursor-pointer shadow-inner">
                                        {updateData.image ? (
                                            <div className="relative w-full h-full group">
                                                <img src={updateData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Sport Identity" />
                                                <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/20 px-4 py-2 rounded-full border border-white/30">Replace Brand Asset</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center group-hover:scale-110 transition-transform duration-300">
                                                <div className="text-3xl mb-2">🏟️</div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Upload Sport Banner</span>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setUpdateData({...updateData, image: reader.result});
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                        />
                                    </div>
                                    <p className="mt-3 text-[9px] text-gray-300 font-medium italic">Recommended ratio 16:9 for optimal display across the platform.</p>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Sport Official Title</label>
                                    <input 
                                        type="text" 
                                        value={updateData.name} 
                                        onChange={(e) => setUpdateData({...updateData, name: e.target.value})}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold text-gray-900 focus:ring-2 ring-indigo-50 outline-none transition-all" 
                                        placeholder="e.g. SLIIT Cricket Team"
                                    />
                                    <p className="mt-2 text-[9px] text-gray-300 font-medium">Changing the title will update the name across all management views.</p>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Department Overview / Description</label>
                                    <textarea 
                                        rows={6}
                                        value={updateData.description} 
                                        onChange={(e) => setUpdateData({...updateData, description: e.target.value})}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold text-gray-900 focus:ring-2 ring-indigo-50 outline-none transition-all resize-none" 
                                        placeholder="Describe the goals, training schedule, or requirements for this sport..."
                                    />
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="submit"
                                        disabled={updateStatus.loading || updateStatus.uploadLoading}
                                        className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl shadow-gray-100 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {updateStatus.uploadLoading ? "Uploading Asset..." : updateStatus.loading ? "Synchronizing..." : "Update Department Info"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, color, bg, icon, subText }) {
    return (
        <div className={`rounded-[28px] ${bg} p-7 flex flex-col gap-4 shadow-sm border border-gray-50 transition-transform hover:-translate-y-1`}>
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">{icon}</div>
                <div className={`text-3xl font-black ${color}`}>{value}</div>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
                <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase">{subText}</p>
            </div>
        </div>
    );
}
