"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const MENU_ITEMS = [
    { id: "Overview", icon: "📊", label: "Overview", href: "/dashboard/sub-admin" },
    { id: "Management", icon: "🏢", label: "Dept Management", href: "/dashboard/sub-admin" },
    { id: "Coaches", icon: "👨‍🏫", label: "Coaches", active: true },
    { id: "Equipment", icon: "🏸", label: "Equipment Tracking", href: "/dashboard/sub-admin" },
    { id: "Settings", icon: "⚙️", label: "Settings", href: "/dashboard/sub-admin" },
];

export default function GlobalCoachesPage() {
    const { data: session } = useSession();
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coachesData, setCoachesData] = useState({});

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const res = await fetch("/api/user/assigned-sports");
                if (res.ok) {
                    const sportsList = await res.json();
                    setSports(sportsList);
                    
                    // Fetch coaches for each sport
                    const coachesMap = {};
                    await Promise.all(sportsList.map(async (sport) => {
                        const cRes = await fetch(`/api/user/sport-coaches?sportName=${encodeURIComponent(sport.name)}`);
                        if (cRes.ok) {
                            coachesMap[sport.id] = await cRes.json();
                        }
                    }));
                    setCoachesData(coachesMap);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

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
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 block mb-1">Navigation</span>
                        <span className="text-sm font-black text-gray-900">Coaches View</span>
                    </div>

                    {MENU_ITEMS.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href || "#"}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${item.active
                                ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
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
                        <h1 className="text-2xl font-black text-gray-900">Assigned Coaches</h1>
                        <p className="text-xs text-gray-400 font-medium mt-1">Staff oversight across all departments</p>
                    </div>

                    <div className="flex items-center gap-6">
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

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {sports.map((sport) => (
                            <div key={sport.id} className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-sky-900 text-white flex items-center justify-center font-black text-sm uppercase">
                                            {sport.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{sport.name} Staff</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{coachesData[sport.id]?.length || 0} Assigned Coaches</p>
                                        </div>
                                    </div>
                                    <Link 
                                        href={`/dashboard/sub-admin/sports/${sport.id}`}
                                        className="text-[10px] font-black uppercase text-sky-600 hover:underline"
                                    >
                                        Manage Sport →
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {coachesData[sport.id]?.length > 0 ? (
                                        coachesData[sport.id].map((coach) => (
                                            <div key={coach.id} className="p-6 bg-white rounded-[28px] border border-gray-50 shadow-sm hover:border-sky-100 transition-all group">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center font-black text-sky-600 text-xs">
                                                        {coach.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{coach.name}</div>
                                                        <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{coach.status}</div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400 space-y-1">
                                                    <div>ID: {coach.universityId}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-10 bg-gray-50/50 rounded-[28px] border border-dashed border-gray-200 text-center">
                                            <p className="text-xs text-gray-400 font-medium italic">No coaches assigned to this department.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
