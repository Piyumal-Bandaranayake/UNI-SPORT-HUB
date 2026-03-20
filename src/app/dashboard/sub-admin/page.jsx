"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const MENU_ITEMS = [
    { id: "Overview", icon: "📊", label: "Overview" },
    { id: "Management", icon: "🏢", label: "Dept Management" },
    { id: "Coaches", icon: "👨‍🏫", label: "Coaches", href: "/dashboard/sub-admin/sports" },
    { id: "Equipment", icon: "🏸", label: "Equipment Tracking" },
    { id: "Settings", icon: "⚙️", label: "Settings" },
];

export default function SubAdminDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("Overview");
    const [sports, setSports] = useState([]);
    const [inventoryData, setInventoryData] = useState({});
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const res = await fetch("/api/user/assigned-sports");
                if (res.ok) {
                    const data = await res.json();
                    setSports(data);
                    fetchAllInventory(data);
                }
            } catch (err) {
                console.error("Failed to fetch sports:", err);
            }
        };
        fetchSports();
    }, []);

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
                            <span className="absolute top-0 right-0 w-2 h-2 bg-sky-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center font-black text-sky-600">
                                {session?.user?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">{session?.user?.name}</div>
                                <div className="text-[10px] text-gray-400 font-medium">Sub-Admin</div>
                            </div>
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
                                <StatCard label="Active Status" value="Online" color="text-emerald-700" bg="bg-[#ECFDF5]" icon="✅" subText="System operational" />
                            </div>

                            <div className="mt-12">
                                <h3 className="text-lg font-black text-gray-900 mb-8">Department Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {sports.map((sport) => (
                                        <div key={sport.id} className="bg-white p-6 rounded-[28px] border border-gray-50 group hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 font-black text-xl">
                                                        {sport.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 uppercase tracking-tight">{sport.name}</h4>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Assigned Sport</span>
                                                    </div>
                                                </div>
                                                <Link href={`/sports/${sport.id}`} target="_blank" className="text-[10px] font-black uppercase text-gray-400 hover:text-sky-600 flex items-center gap-1 transition-all">
                                                    Public View ↗
                                                </Link>
                                            </div>
                                            
                                            <Link 
                                                href={`/dashboard/sub-admin/sports/${sport.id}`} 
                                                className="w-full bg-gray-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase text-center block hover:bg-sky-600 transition-all shadow-lg shadow-gray-100"
                                            >
                                                Manage Dashboard
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "Management" && (
                         <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-8 underline decoration-sky-200 underline-offset-8 decoration-4">Department Management</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sports.length > 0 ? sports.map((sport) => (
                                    <div key={sport.id} className="p-6 bg-[#FAFBFD] rounded-[28px] border border-gray-50 group">
                                         <div className="flex items-center justify-between mb-6">
                                             <div className="font-black text-gray-900 uppercase tracking-tight">{sport.name}</div>
                                             <span className="text-[10px] font-black bg-sky-50 text-sky-600 px-3 py-1 rounded-full uppercase">Managed</span>
                                         </div>
                                         <div className="space-y-3">
                                             <Link 
                                                href={`/dashboard/sub-admin/sports/${sport.id}`}
                                                className="w-full bg-white border border-gray-100 py-3 rounded-2xl text-[10px] font-black uppercase text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-all block text-center"
                                             >
                                                Open Management Dashboard
                                             </Link>
                                             <button className="w-full bg-white border border-gray-100 py-3 rounded-2xl text-[10px] font-black uppercase text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-all">View Applications</button>
                                         </div>
                                    </div>
                                )) : <div className="text-gray-400 italic py-10 text-center col-span-2">No departments assigned to you.</div>}
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
                            <h3 className="text-xl font-black text-gray-900 mb-6 font-medium">Sub-Admin Profile</h3>
                            <div className="space-y-6 max-w-md">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                                    <input type="text" defaultValue={session?.user?.name} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-sky-50" readOnly />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">University ID</label>
                                    <input type="text" defaultValue={session?.user?.universityId} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-400 outline-none cursor-not-allowed" readOnly />
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all">Update Account</button>
                                    <button onClick={() => signOut()} className="px-6 py-4 rounded-2xl font-bold text-sm text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all">Sign Out</button>
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
