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
    { id: "Overview", icon: "📊", label: "Dashboard" },
    { id: "Sports", icon: "🏸", label: "Sports" },
    { id: "Sub-Admins", icon: "👥", label: "Sub-Admins" },
    { id: "Coaches", icon: "🧢", label: "Coaches" },
    { id: "Students", icon: "🎓", label: "Students" },
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

    useEffect(() => {
        if (session) fetchAll();
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

    const handleToggleStatus = async (id, newStatus) => {
        try {
            const res = await fetch("/api/admin/sports", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (res.ok) {
                fetchAll();
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
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-40">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tighter text-gray-900">
                            Uni<span className="text-indigo-600">Sport</span>Hub
                        </span>
                    </Link>
                </div>

                <div className="px-6 space-y-2 flex-1">
                    <button
                        onClick={handleAddClick}
                        className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-2xl transition-all group mb-8"
                    >
                        <span className="font-bold text-sm">Create New</span>
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
                                <div className="text-[10px] text-gray-400 font-medium">Administrator</div>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                🚪
                            </button>
                        </div>
                    </div>
                </header>

                {/* Banner Greeting */}
                {activeTab === "Overview" && (
                    <div className="relative mb-10 overflow-hidden rounded-[32px] bg-indigo-600 p-10 shadow-2xl shadow-indigo-100">
                        {/* Abstract background blobs */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="max-w-md">
                                <h2 className="text-4xl font-black text-white leading-tight">
                                    Hi, {session?.user?.name?.split(' ')[0]}
                                </h2>
                                <p className="mt-4 text-indigo-100 font-medium">
                                    Ready to manage your university sports hub? <br />
                                    Check latest updates and new student requests below.
                                </p>
                            </div>
                            <div className="hidden lg:block relative">
                                <div className="w-56 h-40 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center">
                                    <svg viewBox="0 0 100 100" className="w-32 h-32 opacity-80">
                                        <path fill="white" d="M10,80 Q50,20 90,80 T90,80 Z" />
                                        <circle cx="50" cy="40" r="10" fill="#EEF2FF" />
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
                            rows={sports}
                            isPending={isPending}
                            onDelete={(id, name) => handleDelete("SPORT", id, name)}
                            onToggleStatus={handleToggleStatus}
                        />
                    )}

                    {/* ─── SUB-ADMINS TAB ─── */}
                    {activeTab === "Sub-Admins" && (
                        <AccountTable
                            title="Sub-Admin Accounts"
                            rows={subAdmins}
                            isPending={isPending}
                            emptyMessage='No sub-admins yet. Click "Create New" to add one.'
                            accentColor="indigo"
                            onAssign={handleAssign}
                            onDelete={(id, name) => handleDelete("SUB_ADMIN", id, name)}
                            userType="SUB_ADMIN"
                        />
                    )}

                    {/* ─── COACHES TAB ─── */}
                    {activeTab === "Coaches" && (
                        <AccountTable
                            title="Coach Accounts"
                            rows={coaches}
                            isPending={isPending}
                            emptyMessage='No coaches yet. Click "Create New" to add one.'
                            accentColor="emerald"
                            onAssign={handleAssign}
                            onDelete={(id, name) => handleDelete("COACH", id, name)}
                            userType="COACH"
                        />
                    )}

                    {/* ─── STUDENTS TAB ─── */}
                    {activeTab === "Students" && (
                        <StudentsTable
                            rows={students}
                            isPending={isPending}
                            onEdit={handleEditStudent}
                            onDelete={(id, name) => handleDelete("STUDENT", id, name)}
                        />
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

function AccountTable({ title, rows, isPending, emptyMessage, accentColor, onAssign, onDelete, userType }) {
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
                                        <div className="flex justify-center gap-2">
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
                                <div className="pt-4 border-t border-gray-200/50 flex items-center justify-between">
                                    <Link
                                        href={`/sports/${row.id}`}
                                        className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase hover:bg-indigo-600 hover:text-white transition-all"
                                    >
                                        View Profile
                                    </Link>
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

function StudentsTable({ rows, isPending, onEdit, onDelete }) {
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {rows.map((row) => (
                        <div key={row.id} className="flex items-center justify-between p-6 bg-[#FAFBFD] rounded-[28px] border border-gray-50 transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-50 group">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-indigo-600 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    {row.name.substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{row.name}</div>
                                    <div className="text-[10px] font-mono font-black text-gray-400 mt-0.5">{row.universityId}</div>
                                    <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${badge[row.status] || ""}`}>{row.status}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <div className="text-[10px] font-black text-gray-300" suppressHydrationWarning>{new Date(row.createdAt).toLocaleDateString()}</div>
                                <div className="flex gap-2">
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
