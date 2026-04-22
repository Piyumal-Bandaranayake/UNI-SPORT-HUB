"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import CreateSubAdminForm from "@/components/CreateSubAdminForm";
import CreateCoachForm from "@/components/CreateCoachForm";
import CreateSportForm from "@/components/CreateSportForm";
import AssignSportForm from "@/components/AssignSportForm";
import EditStudentForm from "@/components/EditStudentForm";

const MENU_ITEMS = [
    { id: "Overview", icon: "", label: "Dashboard" },
    { id: "Sports", icon: "", label: "Sports" },
    { id: "Sub-Admins", icon: "", label: "Sub-Admins" },
    { id: "Coaches", icon: "", label: "Coaches" },
    { id: "Students", icon: "", label: "Students" },
];

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("Overview");
    const [subAdmins, setSubAdmins] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [sports, setSports] = useState([]);
    const [students, setStudents] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [panelType, setPanelType] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isPending, startTransition] = useTransition();

    const fetchAll = () => {
        startTransition(async () => {
            try {
                const [saRes, coachRes, sportRes, studentRes] = await Promise.all([
                    fetch("/api/admin/sub-admins"),
                    fetch("/api/admin/coaches"),
                    fetch("/api/admin/sports"),
                    fetch("/api/admin/students")
                ]);

                if (!saRes.ok || !coachRes.ok || !sportRes.ok || !studentRes.ok) throw new Error("Failed to fetch data");

                const saData = await saRes.json();
                const coachData = await coachRes.json();
                const sportData = await sportRes.json();
                const studentData = await studentRes.json();

                setSubAdmins(saData);
                setCoaches(coachData);
                setSports(sportData);
                setStudents(studentData);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        });
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/admin/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleDeleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        if (session) {
            fetchAll();
            fetchNotifications();
        }
    }, [session]);

    const handleSuccess = () => {
        setShowPanel(false);
        setEditingUser(null);
        fetchAll();
    };

    const handleAssign = (user) => {
        setEditingUser(user);
        setPanelType('ASSIGN');
        setShowPanel(true);
    };

    const handleEditStudent = (student) => {
        setEditingUser(student);
        setPanelType('EDIT_STUDENT');
        setShowPanel(true);
    };

    const handleDelete = async (type, id, name) => {
        if (!confirm(`Are you sure you want to remove "${name}"? This action cannot be undone.`)) return;

        let endpoint = "";
        if (type === "SUB_ADMIN") endpoint = "/api/admin/sub-admins";
        else if (type === "COACH") endpoint = "/api/admin/coaches";
        else if (type === "SPORT") endpoint = "/api/admin/sports";
        else if (type === "STUDENT") endpoint = "/api/admin/students";

        try {
            const res = await fetch(endpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                fetchAll();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong");
        }
    };

    const handleToggleStatus = async (type, id, newStatus) => {
        let endpoint = "";
        if (type === "SPORT") endpoint = "/api/admin/sports";
        else if (type === "SUB_ADMIN") endpoint = "/api/admin/sub-admins";
        else if (type === "COACH") endpoint = "/api/admin/coaches";
        else if (type === "STUDENT") endpoint = "/api/admin/students";

        try {
            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (res.ok) {
                const updateState = (items) => items.map(item => item.id === id ? { ...item, status: newStatus } : item);

                if (type === "SPORT") setSports(prev => updateState(prev));
                else if (type === "SUB_ADMIN") setSubAdmins(prev => updateState(prev));
                else if (type === "COACH") setCoaches(prev => updateState(prev));
                else if (type === "STUDENT") setStudents(prev => updateState(prev));
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Status update error:", error);
            alert("Something went wrong");
        }
    };

    const handleAddClick = () => {
        setPanelType('CREATE');
        setShowPanel(true);
    };

    const panelTitle = panelType === 'ASSIGN'
        ? `Assign Sports to ${editingUser?.name}`
        : panelType === 'EDIT_STUDENT'
            ? `Edit Student: ${editingUser?.name}`
            : activeTab === "Coaches" ? "Create Coach" : activeTab === "Sports" ? "Create Sport" : "Create Sub-Admin";

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]" suppressHydrationWarning>
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-950 border-r border-indigo-900 flex flex-col fixed inset-y-0 left-0 z-40">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tighter text-white">
                            Uni<span className="text-indigo-400">Sport</span>Hub
                        </span>
                    </Link>
                </div>

                <div className="px-6 space-y-2 flex-1">
                    <button
                        onClick={handleAddClick}
                        className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 text-indigo-100 px-4 py-3 rounded-2xl transition-all group mb-8"
                    >
                        <span className="font-bold text-sm">Create New</span>
                        <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-lg leading-none transition-transform group-hover:rotate-90">＋</span>
                    </button>

                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-indigo-200 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 border-t border-indigo-900/50 bg-indigo-950/50 backdrop-blur-md space-y-3">
                    <Link
                        href="/"
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-indigo-300 hover:bg-white/10 hover:text-white transition-all underline decoration-indigo-500/0 hover:decoration-indigo-500/50 underline-offset-4"
                    >
                        <span className="text-base">🏠</span>
                        Back to Home
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
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
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">{activeTab}</h1>
                            <p className="text-xs text-gray-400 font-medium mt-1">Monday, 02 March 2026</p>
                        </div>
                        {activeTab !== "Overview" && activeTab !== "Students" && activeTab !== "Home" && (
                            <button
                                onClick={handleAddClick}
                                className="ml-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                                <span className="text-sm">＋</span>
                                Add {activeTab === "Sub-Admins" ? "Sub-Admin" : activeTab === "Coaches" ? "Coach" : "Sport"}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 max-w-xl px-12">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">🔍</span>
                            <input 
                                type="text" 
                                placeholder={`Search through ${activeTab.toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-2xl py-2.5 pl-12 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors font-bold text-[10px]"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="text-gray-400 hover:text-gray-900 transition-colors">✉️</button>
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`text-gray-400 hover:text-gray-900 transition-colors relative ${showNotifications ? 'text-indigo-600' : ''}`}
                            >
                                🔔
                                {notifications.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>}
                            </button>

                            {showNotifications && (
                                <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-[32px] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                        <h3 className="font-black text-gray-900 text-sm">Notifications</h3>
                                        <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">{notifications.length} New</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="py-20 text-center flex flex-col items-center justify-center">
                                                <span className="text-4xl mb-4 grayscale opacity-20">📭</span>
                                                <p className="text-xs text-gray-300 font-bold italic tracking-wide">All caught up! No alerts.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-50">
                                                {notifications.map((n) => (
                                                    <div key={n.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group/noti relative">
                                                        <div className="flex gap-4">
                                                            <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-lg ${n.type === 'SPORT_REQUEST' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                                {n.type === 'SPORT_REQUEST' ? '🏸' : '🎓'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="text-[11px] font-black text-gray-900 group-hover/noti:text-indigo-600 transition-colors mb-1">{n.title}</div>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteNotification(n.id);
                                                                        }}
                                                                        className="opacity-0 group-hover/noti:opacity-100 p-1.5 -mr-1.5 -mt-1 rounded-lg hover:bg-rose-50 text-rose-400 transition-all font-black text-[10px]"
                                                                        title="Clear notification"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                                <p className="text-[10px] text-gray-400 font-bold leading-tight">{n.message}</p>
                                                                <div className="mt-2 text-[8px] font-black uppercase tracking-widest text-gray-300 flex items-center gap-1.5">
                                                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                                    {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-gray-50 text-center">
                                        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Notification Center</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button 
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 pl-6 border-l border-gray-100 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-all group lg:min-w-[180px]"
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                    {session?.user?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left hidden lg:block flex-1">
                                    <div className="text-xs font-black text-gray-900 leading-tight truncate">{session?.user?.name}</div>
                                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mt-1">Administrator</div>
                                </div>
                                <span className={`text-[10px] text-gray-300 group-hover:text-gray-900 transition-transform duration-300 hidden lg:block ${showProfileMenu ? 'rotate-180' : ''}`}>▼</span>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute top-full right-0 mt-4 w-60 bg-white rounded-[32px] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-50">Account Integrity</div>
                                        <div className="text-[11px] font-black text-gray-900 truncate">{session?.user?.email}</div>
                                        <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
                                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                                            Verified Account
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <button 
                                            onClick={() => { setActiveTab("Settings"); setShowProfileMenu(false); }}
                                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-tight text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                                        >
                                            <span className="text-sm">⚙️</span> General Settings
                                        </button>
                                        <button 
                                            onClick={() => signOut({ callbackUrl: "/login" })}
                                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-tight text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                                        >
                                            <span className="text-sm">🚪</span> Sign Out System
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Banner Greeting */}
                {activeTab === "Overview" && (
                    <div className="relative mb-10 overflow-hidden rounded-none bg-slate-900 p-10 shadow-2xl shadow-slate-900/40">
                        {/* Abstract background blobs */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-slate-500/10 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="max-w-md">
                                <h2 className="text-4xl font-black text-white leading-tight">
                                    Hi, {session?.user?.name?.split(' ')[0]}
                                </h2>
                                <p className="mt-4 text-slate-200 font-medium">
                                    Ready to manage your university sports hub? <br />
                                    Check latest updates and new student requests below.
                                </p>
                            </div>
                            <div className="hidden lg:block relative">
                                <div className="w-56 h-40 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center">
                                    <svg viewBox="0 0 100 100" className="w-32 h-32 opacity-80">
                                        <path fill="white" d="M10,80 Q50,20 90,80 T90,80 Z" />
                                        <circle cx="50" cy="40" r="10" fill="#0C4A6E" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content */}
                <div className="space-y-10">
                    {/* ─── OVERVIEW TAB ─── */}
                    {activeTab === "Overview" && (
                        <div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <StatCard label="Sports" value={sports.length} color="text-amber-700" bg="bg-[#FFF4E5]" icon="🏸" subText="83% Open Rate" />
                                <StatCard label="Sub-Admins" value={subAdmins.length} color="text-indigo-700" bg="bg-[#EEF2FF]" icon="👥" subText="77% Complete" />
                                <StatCard label="Coaches" value={coaches.length} color="text-rose-700" bg="bg-[#FFF1F2]" icon="🧢" subText="91 Unique Views" />
                                <StatCard label="Students" value={students.length} color="text-purple-700" bg="bg-[#F3E8FF]" icon="🎓" subText="126 Total Views" />
                            </div>

                            <div className="mt-12">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center justify-between">
                                    Recent Activity
                                    <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
                                </h3>
                                <div className="space-y-4">
                                    {sports.slice(0, 3).map((sport) => (
                                        <div key={sport.id} className="bg-white p-4 rounded-3xl flex items-center justify-between shadow-sm border border-gray-100 group hover:shadow-lg transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                    {sport.image ? (
                                                        <img src={sport.image} alt={sport.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-xl bg-gray-50">
                                                            {sport.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm text-gray-900">{sport.name}</h4>
                                                    <p className="text-[10px] text-gray-400 font-medium leading-none mt-1">Managed Sport Department</p>
                                                    <div className="mt-1.5 flex gap-1">
                                                       <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                       <span className="text-[9px] font-bold text-emerald-600 uppercase">Live Now</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden sm:flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">SA</div>
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">CH</div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">✏️</button>
                                                    <button onClick={() => handleDelete("SPORT", sport.id, sport.name)} className="p-2 hover:bg-rose-50 rounded-xl text-rose-400 transition-colors">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── SPORTS TAB ─── */}
                    {activeTab === "Sports" && (
                        <SportsTable
                            rows={sports.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                            isPending={isPending}
                            onDelete={(id, name) => handleDelete("SPORT", id, name)}
                            onToggleStatus={(id, status) => handleToggleStatus("SPORT", id, status)}
                        />
                    )}

                    {/* ─── SUB-ADMINS TAB ─── */}
                    {activeTab === "Sub-Admins" && (
                        <AccountTable
                            title="Sub-Admin Accounts"
                            rows={subAdmins.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()))}
                            isPending={isPending}
                            emptyMessage='No sub-admins found matching your search.'
                            accentColor="indigo"
                            onAssign={handleAssign}
                            onDelete={(id, name) => handleDelete("SUB_ADMIN", id, name)}
                            onToggleStatus={(id, status) => handleToggleStatus("SUB_ADMIN", id, status)}
                            userType="SUB_ADMIN"
                        />
                    )}

                    {/* ─── COACHES TAB ─── */}
                    {activeTab === "Coaches" && (
                        <AccountTable
                            title="Coach Accounts"
                            rows={coaches.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))}
                            isPending={isPending}
                            emptyMessage='No coaches found matching your search.'
                            accentColor="emerald"
                            onAssign={handleAssign}
                            onDelete={(id, name) => handleDelete("COACH", id, name)}
                            onToggleStatus={(id, status) => handleToggleStatus("COACH", id, status)}
                            userType="COACH"
                        />
                    )}

                    {/* ─── STUDENTS TAB ─── */}
                    {activeTab === "Students" && (
                        <StudentsTable
                            rows={students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.universityId.toLowerCase().includes(searchQuery.toLowerCase()))}
                            isPending={isPending}
                            onEdit={handleEditStudent}
                            onDelete={(id, name) => handleDelete("STUDENT", id, name)}
                            onToggleStatus={(id, status) => handleToggleStatus("STUDENT", id, status)}
                        />
                    )}

                    {/* ─── SETTINGS TAB ─── */}
                    {activeTab === "Settings" && (
                        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                            <div className="mb-10">
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">System Configuration</h3>
                                <p className="text-sm text-gray-400 font-medium mt-1">Manage global preferences and account security.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="w-6 h-[1px] bg-indigo-100"></span> Profile Information
                                        </h4>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
                                                <input type="text" readOnly defaultValue={session?.user?.name} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none cursor-not-allowed" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                                                <input type="text" readOnly defaultValue={session?.user?.email} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none cursor-not-allowed" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="w-6 h-[1px] bg-rose-100"></span> Danger Zone
                                        </h4>
                                        <div className="p-6 bg-rose-50/50 rounded-[32px] border border-rose-100/50">
                                            <p className="text-[11px] text-rose-800 font-bold mb-4 opacity-80 leading-relaxed uppercase tracking-tight">Access Restricted. Changes here affect platform global stability.</p>
                                            <button 
                                                onClick={() => signOut()}
                                                className="w-full bg-rose-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                                            >
                                                Logout of Session
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-600 rounded-[48px] p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div className="space-y-6">
                                            <div className="w-16 h-16 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center text-3xl shadow-xl">👑</div>
                                            <h4 className="text-3xl font-black text-white leading-tight">Master Admin Access</h4>
                                            <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90">Your account has full administrative privileges. You can manage all sports, students, and staff across the university.</p>
                                        </div>
                                        <div className="pt-12">
                                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10">
                                                <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Account Integrity</div>
                                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full w-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                                                </div>
                                                <div className="mt-3 text-[10px] font-black text-white uppercase flex justify-between">
                                                    <span>Verified Status</span>
                                                    <span>Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Centered Modal Popup */}
            {showPanel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowPanel(false)} />
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-[32px] flex flex-col p-8 border border-white/20 transform transition-all animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">{panelTitle}</h2>
                                <p className="text-xs text-gray-400 font-medium mt-1">Please fill in the details below</p>
                            </div>
                            <button 
                                onClick={() => setShowPanel(false)} 
                                className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar pr-2">
                            {panelType === 'ASSIGN' ? (
                                <AssignSportForm user={editingUser} userType={activeTab === "Coaches" ? "COACH" : "SUB_ADMIN"} allSports={sports} onSuccess={handleSuccess} />
                            ) : panelType === 'EDIT_STUDENT' ? (
                                <EditStudentForm student={editingUser} onSuccess={handleSuccess} />
                            ) : activeTab === "Coaches" || panelType === 'CREATE_COACH' ? (
                                <CreateCoachForm onSuccess={handleSuccess} />
                            ) : activeTab === "Sports" || panelType === 'CREATE_SPORT' ? (
                                <CreateSportForm onSuccess={handleSuccess} />
                            ) : (
                                <CreateSubAdminForm onSuccess={handleSuccess} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Reusable Sub-Components ─── */

function StatCard({ label, value, color, bg, icon, subText }) {
    return (
        <div className={`rounded-3xl ${bg} p-5 flex items-center gap-5 shadow-sm border border-white/40 transition-all hover:shadow-xl hover:-translate-y-1 group`}>
            <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">{icon}</div>
            <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                <div className={`text-2xl font-black ${color} flex items-baseline gap-2`}>
                    {value}
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{subText.split(' ')[0]}</span>
                </div>
            </div>
        </div>
    );
}

function AccountTable({ title, rows, isPending, emptyMessage, accentColor, onAssign, onDelete, onToggleStatus, userType }) {
    const badge = {
        ACTIVE: "bg-green-100 text-green-700",
        BLOCKED: "bg-red-100 text-red-700",
    };

    return (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="mb-8 text-xl font-black text-gray-900 underline decoration-indigo-200 underline-offset-8 decoration-4">{title}</h2>
            {isPending ? (
                <div className="flex items-center justify-center py-20 text-gray-400 font-bold italic animate-pulse">Loading secure data…</div>
            ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                    <p className="font-bold">{emptyMessage}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                        <thead className="bg-[#FAFBFD] rounded-xl overflow-hidden">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">#</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Departments</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rows.map((row, i) => (
                                <tr key={row.id} className="hover:bg-[#FAFBFD] transition-colors group">
                                    <td className="px-6 py-5 text-gray-400 font-bold">{i + 1}</td>
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{row.name}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-xs text-gray-500 font-bold lowercase">{row.email}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1">
                                            {(userType === "SUB_ADMIN" ? row.managedSports : row.assignedSports)?.length > 0 ? (
                                                (userType === "SUB_ADMIN" ? row.managedSports : row.assignedSports).map(s => (
                                                    <span key={s} className="bg-white border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                                                        {s}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-300 italic text-[10px]">None Assigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge[row.status] || ""}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center items-center gap-3">
                                            <button 
                                                onClick={() => onToggleStatus(row.id, row.status === "ACTIVE" ? "BLOCKED" : "ACTIVE")}
                                                className={`w-10 h-5 rounded-full relative transition-all duration-300 group/toggle ${row.status === "ACTIVE" ? "bg-indigo-600 shadow-inner shadow-indigo-800/20" : "bg-gray-200"}`}
                                                title={row.status === "ACTIVE" ? "Deactivate Account" : "Activate Account"}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${row.status === "ACTIVE" ? "right-0.5" : "left-0.5"}`}></div>
                                            </button>
                                            <div className="h-4 w-[1px] bg-gray-100 mx-1"></div>
                                            <button onClick={() => onAssign(row)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Assign</button>
                                            <button onClick={() => onDelete(row.id, row.name)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">Remove</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function SportsTable({ rows, isPending, onDelete, onToggleStatus }) {
    const [downloadingId, setDownloadingId] = useState(null);

    const handleDownloadPDF = async (sportId, sportName) => {
        setDownloadingId(sportId);
        try {
            // Fetch sport details from API
            const response = await fetch(`/api/admin/sports/${sportId}`);
            if (!response.ok) throw new Error('Failed to fetch sport details');
            
            const { sport, approvedMembers, pendingRequests, assignedCoaches } = await response.json();

            // Import PDF generation function dynamically
            const { generateSportDetailsPDF } = await import('@/lib/generateSportPDF');
            
            // Generate PDF
            const doc = await generateSportDetailsPDF(sport, approvedMembers, pendingRequests, assignedCoaches);
            
            // Download PDF
            doc.save(`${sportName.replace(/\s+/g, '_')}_Details_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="mb-8 text-xl font-black text-gray-900 underline decoration-indigo-200 underline-offset-8 decoration-4">University Sports</h2>
            {isPending ? (
                <div className="flex items-center justify-center py-20 text-gray-400 font-bold animate-pulse">Fetching department data…</div>
            ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-300">
                    <p className="font-bold">No departments added yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rows.map((row) => (
                        <div key={row.id} className="bg-[#FAFBFD] p-6 rounded-[28px] border border-gray-50 group hover:shadow-lg transition-all hover:-translate-x-1">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
                                        {row.image ? <img src={row.image} className="w-full h-full object-cover" /> : <span className="text-2xl">{row.name.substring(0, 1)}</span>}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{row.name}</h4>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${row.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                           {row.status} DEPT
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => onDelete(row.id, row.name)} className="text-gray-300 hover:text-rose-500 transition-colors">🗑️</button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Team Personnel</div>
                                    <div className="flex flex-wrap gap-2">
                                        {[...(row.assignedSubAdmins || []), ...(row.assignedCoaches || [])].length > 0 ? (
                                            [...(row.assignedSubAdmins || []), ...(row.assignedCoaches || [])].map((p, idx) => (
                                                <span key={idx} className="bg-white px-3 py-1 rounded-xl text-[10px] font-bold text-gray-700 shadow-sm border border-gray-50">{p}</span>
                                            ))
                                        ) : <span className="text-[10px] text-gray-300 italic">No assigned staff</span>}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200/50 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/sports/${row.id}`}
                                            className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            View Profile
                                        </Link>
                                        <button
                                            onClick={() => handleDownloadPDF(row.id, row.name)}
                                            disabled={downloadingId === row.id}
                                            className="text-[10px] font-black text-white bg-red-600 px-3 py-1 rounded-full uppercase hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Download sport details as PDF"
                                        >
                                            PDF
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => onToggleStatus(row.id, row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${row.status === "ACTIVE" ? "bg-indigo-600" : "bg-gray-300"}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${row.status === "ACTIVE" ? "right-1" : "left-1"}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StudentsTable({ rows, isPending, onEdit, onDelete, onToggleStatus }) {
    const badge = {
        ACTIVE: "bg-green-100 text-green-700",
        BLOCKED: "bg-red-100 text-red-700",
    };

    return (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="mb-8 text-xl font-black text-gray-900 underline decoration-indigo-200 underline-offset-8 decoration-4">Student Community</h2>
            {isPending ? (
                <div className="flex items-center justify-center py-20 text-gray-400 font-bold italic animate-pulse">Accessing registry…</div>
            ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                    <p className="font-bold">Registry is empty.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {rows.map((row) => (
                        <div key={row.id} className="flex items-center justify-between p-5 bg-[#FAFBFD] rounded-[28px] border border-gray-50 transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-50/40 group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-50 flex items-center justify-center font-black text-indigo-600 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    {row.name.substring(0, 1).toUpperCase()}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12">
                                    <div className="min-w-[150px]">
                                        <div className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{row.name}</div>
                                        <div className="text-[10px] font-mono font-black text-gray-400 mt-0.5">{row.universityId}</div>
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Email Registry</div>
                                        <div className="text-[11px] font-bold text-gray-500 lowercase">{row.universityEmail}</div>
                                    </div>
                                    <div className={`inline-flex rounded-full px-3 py-1 text-[8px] font-black uppercase self-start sm:self-center ${badge[row.status] || ""}`}>{row.status}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="hidden sm:block text-[10px] font-black text-gray-300 uppercase tracking-widest text-right" suppressHydrationWarning>
                                    Joined Registry<br/> {new Date(row.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => onToggleStatus(row.id, row.status === "ACTIVE" ? "BLOCKED" : "ACTIVE")}
                                        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${row.status === "ACTIVE" ? "bg-indigo-600 shadow-inner" : "bg-gray-200"}`}
                                        title={row.status === "ACTIVE" ? "Deactivate Student" : "Activate Student"}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${row.status === "ACTIVE" ? "right-0.5" : "left-0.5"}`}></div>
                                    </button>
                                    <div className="h-6 w-[1px] bg-gray-100 mx-1"></div>
                                    <button onClick={() => onEdit(row)} className="p-2 hover:bg-indigo-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">✏️</button>
                                    <button onClick={() => onDelete(row.id, row.name)} className="p-2 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-500 transition-all">🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
