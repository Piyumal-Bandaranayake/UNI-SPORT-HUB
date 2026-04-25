"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const MENU_ITEMS = [
    { id: "Overview", icon: "", label: "Overview" },
    { id: "Management", icon: "", label: "Dept Management" },
    { id: "Equipment", icon: "", label: "Equipment Tracking" },
];

export default function SubAdminDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("Overview");
    const [sports, setSports] = useState([]);
    const [inventoryData, setInventoryData] = useState({});
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isPending, startTransition] = useTransition();

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/sub-admin/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        const fetchSportsAndRequests = async () => {
            try {
                const sportsRes = await fetch("/api/user/assigned-sports");
                
                if (sportsRes.ok) {
                    const data = await sportsRes.json();
                    setSports(data);
                    fetchAllInventory(data);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            }
        };
        if (session) {
            fetchSportsAndRequests();
            fetchNotifications();
        }
    }, [session]);

    const fetchAllInventory = async (sportsList) => {
        setLoadingInventory(true);
        try {
            const inventoryMap = {};
            await Promise.all(sportsList.map(async (sport) => {
                const res = await fetch(`/api/user/inventory?sportId=${sport.id}`);
                if (res.ok) {
                    inventoryMap[sport.id] = await res.json();
                }
            }));
            setInventoryData(inventoryMap);
        } catch (err) {
            console.error("Failed to fetch all inventory:", err);
        } finally {
            setLoadingInventory(false);
        }
    };

    const handleUpdateQuantity = async (sportId, itemId, newQuantity) => {
        if (newQuantity < 0) return;
        try {
            const res = await fetch("/api/user/inventory", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: itemId, quantity: newQuantity }),
            });
            if (res.ok) {
                const updated = await res.json();
                setInventoryData({
                    ...inventoryData,
                    [sportId]: inventoryData[sportId].map(item => item._id === itemId ? updated : item)
                });
            }
        } catch (err) {
            console.error("Failed to update quantity:", err);
        }
    };

    const handleDeleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };



    return (
        <div className="flex min-h-screen bg-[#F0F2F5]" suppressHydrationWarning>
            {/* Sidebar */}
            <aside className="w-64 bg-orange-50 border-r border-orange-100 flex flex-col fixed inset-y-0 left-0 z-40">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tighter text-gray-900">
                            Uni<span className="text-sky-600">Sport</span>Hub
                        </span>
                    </Link>
                </div>

                <div className="px-6 space-y-2 flex-1">
                    <div className="bg-sky-50 px-4 py-3 rounded-2xl mb-8 border border-sky-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 block mb-1">Role</span>
                        <span className="text-sm font-black text-gray-900">Sub-Administrator</span>
                    </div>

                    {MENU_ITEMS.map((item) => (
                        item.href ? (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                            </Link>
                        ) : (
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
                        )
                    ))}
                </div>

                <div className="p-6 border-t border-orange-100 bg-white/50 backdrop-blur-md space-y-3">
                    <Link
                        href="/"
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-orange-900/60 hover:bg-orange-100/50 hover:text-orange-900 transition-all"
                    >
                        Back to Home
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
                    >
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
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`text-gray-400 hover:text-gray-900 transition-colors relative ${showNotifications ? 'text-sky-600' : ''}`}
                            >
                                🔔
                                {notifications.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>}
                            </button>

                            {showNotifications && (
                                <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-[32px] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-sky-50/30">
                                        <h3 className="font-black text-gray-900 text-sm">Action Required</h3>
                                        <span className="bg-sky-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{notifications.length} Alerts</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="py-20 text-center flex flex-col items-center justify-center">
                                                <span className="text-4xl mb-4 grayscale opacity-20 text-sky-200">✨</span>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">All systems clear!</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-50">
                                                {notifications.map((n) => (
                                                    <div key={n.id} className="p-5 hover:bg-sky-50 transition-colors cursor-pointer group/noti relative">
                                                        <div className="flex gap-4">
                                                            <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-lg ${n.type === 'SPORT_REQUEST' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                                                {n.type === 'SPORT_REQUEST' ? '🎓' : '🛡️'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="text-[11px] font-black text-gray-900 group-hover/noti:text-sky-600 transition-colors mb-1 uppercase tracking-tight">{n.title}</div>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteNotification(n.id);
                                                                        }}
                                                                        className="opacity-0 group-hover/noti:opacity-100 p-1.5 -mr-1.5 -mt-1 rounded-lg hover:bg-rose-50 text-rose-400 transition-all font-black text-[10px]"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                                <p className="text-[10px] text-gray-500 font-bold leading-tight">{n.message}</p>
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
                                    <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                                        <button className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline">Notification Settings</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button 
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 pl-6 border-l border-gray-100 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-all group lg:min-w-[180px]"
                            >
                                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center font-black text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                    {session?.user?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left hidden lg:block flex-1">
                                    <div className="text-xs font-black text-gray-900 leading-tight truncate">{session?.user?.name}</div>
                                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mt-1 text-sky-500">Sub-Admin</div>
                                </div>
                                <span className={`text-[10px] text-gray-300 group-hover:text-gray-900 transition-transform duration-300 hidden lg:block ${showProfileMenu ? 'rotate-180' : ''}`}>▼</span>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute top-full right-0 mt-4 w-60 bg-white rounded-[32px] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-50">Personnel Verification</div>
                                        <div className="text-[11px] font-black text-gray-900 truncate">{session?.user?.name}</div>
                                        <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase">
                                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                                            Active Session
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <button 
                                            onClick={() => { setActiveTab("Settings"); setShowProfileMenu(false); }}
                                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-tight text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-all border border-transparent hover:border-sky-100"
                                        >
                                            <span className="text-sm">⚙️</span> Adjust Profile
                                        </button>
                                        <button 
                                            onClick={() => signOut({ callbackUrl: "/login" })}
                                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-tight text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                                        >
                                            <span className="text-sm">🚪</span> Exit Console
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Greeting Banner */}
                {activeTab === "Overview" && (
                    <div className="relative mb-10 overflow-hidden rounded-[32px] bg-sky-600 p-10 shadow-2xl shadow-sky-100">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-sky-400/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="max-w-md">
                                <h2 className="text-4xl font-black text-white leading-tight">
                                    Hello, {session?.user?.name?.split(' ')[0]}
                                </h2>
                                <p className="mt-4 text-sky-100 font-medium">
                                    Keeping the gears turning. Manage your departments, track equipment usage, and ensure operational excellence.
                                </p>
                            </div>
                            <div className="hidden lg:block relative">
                                <div className="w-56 h-40 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center">
                                    <span className="text-6xl">🛠️</span>
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
                                <StatCard label="Managed Depts" value={sports.length} color="text-sky-700" bg="bg-[#F0F9FF]" icon="🏢" subText="Assigned sports" />
                                <StatCard 
                                    label="Equipment Items" 
                                    value={Object.values(inventoryData).flat().length} 
                                    color="text-amber-700" bg="bg-[#FFFBEB]" icon="🏸" subText="Total in inventory" 
                                />
                                <StatCard label="Notifications" value={Object.values(inventoryData).flat().filter(i => i.quantity < 10).length} color="text-rose-700" bg="bg-[#FFF1F2]" icon="🔔" subText="New alerts" />
                            </div>

                            <div className="mt-12">
                                <section>
                                    <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center justify-between uppercase tracking-tight">
                                        Department Overview
                                        <button onClick={() => setActiveTab("Management")} className="text-sky-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All Assets</button>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sports.map((sport) => (
                                            <div key={sport.id} className="bg-white p-6 rounded-[32px] border border-gray-100 group hover:shadow-xl hover:shadow-sky-100/30 transition-all border-b-4 border-b-transparent hover:border-b-sky-500 relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 font-black text-lg group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                                            {sport.name.toLowerCase().includes("badminton") ? "🏸" : 
                                                            sport.name.toLowerCase().includes("cricket") ? "🏏" : 
                                                            sport.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 uppercase tracking-tight text-sm">{sport.name}</h4>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Assigned</span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/sports/${sport.id}`} target="_blank" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-300 hover:text-sky-600 hover:bg-sky-50 transition-all">
                                                        ↗
                                                    </Link>
                                                </div>
                                                
                                                <Link 
                                                    href={`/dashboard/sub-admin/sports/${sport.id}`} 
                                                    className="w-full bg-gray-900 text-white py-3 rounded-xl text-[10px] font-black uppercase text-center block hover:bg-sky-600 transition-all shadow-lg shadow-gray-100 active:scale-95"
                                                >
                                                    Manage
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </>
                    )}

                    {activeTab === "Management" && (
                         <div className="space-y-8">
                            
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sports.length > 0 ? sports.map((sport) => (
                                    <div key={sport.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-sky-100/20 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                                        
                                        <div className="relative z-10 flex items-start justify-between mb-6">
                                            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-sky-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                                {sport.name.toLowerCase().includes("badminton") ? "🏸" : 
                                                 sport.name.toLowerCase().includes("cricket") ? "🏏" : 
                                                 sport.name.toLowerCase().includes("football") ? "⚽" : "🏅"}
                                            </div>
                                            <span className="bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-sky-100">
                                                Active Dep
                                            </span>
                                        </div>

                                        <div className="relative z-10 space-y-1 mb-6">
                                            <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">{sport.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sport Admin Control</p>
                                        </div>

                                        <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Items</div>
                                                <div className="text-base font-black text-gray-900">{inventoryData[sport.id]?.length || 0}</div>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</div>
                                                <div className="text-[9px] font-black text-emerald-600 uppercase">Healthy</div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 space-y-2">
                                            <Link 
                                                href={`/dashboard/sub-admin/sports/${sport.id}`}
                                                className="w-full bg-gray-900 text-white py-3 rounded-xl text-[11px] font-black uppercase text-center block hover:bg-sky-600 hover:-translate-y-0.5 transition-all shadow-lg active:scale-95"
                                            >
                                                Open Console
                                            </Link>
                                            <Link
                                                href={`/sports/${sport.id}`}
                                                target="_blank"
                                                className="w-full bg-white border border-gray-100 py-3 rounded-xl text-[11px] font-black uppercase text-gray-400 text-center block hover:bg-gray-50 hover:text-gray-900 transition-all"
                                            >
                                                Public View
                                            </Link>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                                        <span className="text-5xl mb-6">🏢</span>
                                        <h3 className="text-xl font-black text-gray-900 mb-2">No Departments Assigned</h3>
                                        <p className="text-gray-400 text-sm max-w-xs mx-auto">Please contact the system administrator to assign you to a sports department.</p>
                                    </div>
                                )}
                            </div>
                         </div>
                    )}



                    {activeTab === "Equipment" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 min-h-[500px]">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 underline decoration-amber-200 underline-offset-8 decoration-4 uppercase tracking-tight">Global Inventory</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-4">Manage supplies across all assigned departments.</p>
                                </div>
                            </div>

                            {loadingInventory ? (
                                <div className="py-20 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {sports.map((sport) => (
                                        <div key={sport.id} className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm uppercase">
                                                        {sport.name.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{sport.name} Stock</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{inventoryData[sport.id]?.length || 0} Registered Items</p>
                                                    </div>
                                                </div>
                                                <Link 
                                                    href={`/dashboard/sub-admin/sports/${sport.id}`}
                                                    className="text-[10px] font-black uppercase text-amber-600 hover:underline"
                                                >
                                                    Full Management →
                                                </Link>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {inventoryData[sport.id]?.length > 0 ? (
                                                    inventoryData[sport.id].map((item) => (
                                                        <div key={item._id} className="p-6 bg-[#FAFBFD] rounded-[28px] border border-gray-50 flex items-center justify-between group hover:border-amber-100 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">
                                                                    {item.category === "UNIFORM" ? "👕" : item.category === "SAFETY" ? "🛡️" : "🏸"}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{item.name}</div>
                                                                    <div className="text-[10px] font-black text-gray-400 uppercase">{item.condition}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-50 shadow-sm">
                                                                <button 
                                                                    onClick={() => handleUpdateQuantity(sport.id, item._id, item.quantity - 1)}
                                                                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all text-xs"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="text-xs font-black text-gray-900 w-6 text-center">{item.quantity}</span>
                                                                <button 
                                                                    onClick={() => handleUpdateQuantity(sport.id, item._id, item.quantity + 1)}
                                                                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all text-xs"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full py-10 bg-gray-50/50 rounded-[28px] border border-dashed border-gray-200 text-center">
                                                        <p className="text-xs text-gray-400 font-medium italic">No inventory tracked for this department.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Settings" && (
                        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                            <div className="mb-10">
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Console Configuration</h3>
                                <p className="text-sm text-gray-400 font-medium mt-1">Manage your administrative profile and department settings.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="w-6 h-[1px] bg-sky-100"></span> Staff Information
                                        </h4>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
                                                <input type="text" readOnly defaultValue={session?.user?.name} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none cursor-not-allowed" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Assigned Email</label>
                                                <input type="text" readOnly defaultValue={session?.user?.email} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none cursor-not-allowed" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="w-6 h-[1px] bg-rose-100"></span> Termination Zone
                                        </h4>
                                        <div className="p-6 bg-rose-50/50 rounded-[32px] border border-rose-100/50">
                                            <p className="text-[11px] text-rose-800 font-bold mb-4 opacity-80 leading-relaxed uppercase tracking-tight">Security Action Required to log out across all university devices.</p>
                                            <button 
                                                onClick={() => signOut()}
                                                className="w-full bg-rose-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                                            >
                                                Force Terminate Session
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-sky-600 to-sky-800 rounded-[48px] p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div className="space-y-6">
                                            <div className="w-16 h-16 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center text-3xl shadow-xl">🏅</div>
                                            <h4 className="text-3xl font-black text-white leading-tight">Sub-Admin Privileges</h4>
                                            <p className="text-sky-100 text-sm font-medium leading-relaxed opacity-90">Your account is authorized to manage specific sports departments, track equipment, and moderate student activities.</p>
                                        </div>
                                        <div className="pt-12">
                                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10">
                                                <div className="text-[10px] font-black text-sky-200 uppercase tracking-widest mb-2">Role Integrity</div>
                                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full w-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                                                </div>
                                                <div className="mt-3 text-[10px] font-black text-white uppercase flex justify-between">
                                                    <span>Verified Role</span>
                                                    <span>Authorized</span>
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
