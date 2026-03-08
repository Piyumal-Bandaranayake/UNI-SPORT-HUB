"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import CreateSubAdminForm from "@/components/CreateSubAdminForm";
import CreateCoachForm from "@/components/CreateCoachForm";

const TABS = ["Overview", "Sub-Admins", "Coaches"];

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("Overview");
    const [subAdmins, setSubAdmins] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [isPending, startTransition] = useTransition();

    const fetchAll = () => {
        startTransition(async () => {
            try {
                const [saRes, coachRes] = await Promise.all([
                    fetch("/api/admin/sub-admins"),
                    fetch("/api/admin/coaches")
                ]);

                if (!saRes.ok || !coachRes.ok) throw new Error("Failed to fetch data");

                const saData = await saRes.json();
                const coachData = await coachRes.json();

                setSubAdmins(saData);
                setCoaches(coachData);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        });
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleSuccess = () => {
        setShowPanel(false);
        fetchAll();
    };

    const panelTitle = activeTab === "Coaches" ? "Create Coach" : "Create Sub-Admin";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header Bar */}
            <div className="border-b border-gray-200 bg-white px-6 py-5 md:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Logged in as{" "}
                            <span className="font-semibold text-rose-600">{session?.user?.name}</span>{" "}
                            <span className="font-mono text-xs text-gray-400">({session?.user?.universityId})</span>
                        </p>
                    </div>
                    {activeTab !== "Overview" && (
                        <button
                            onClick={() => setShowPanel(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <span className="text-base leading-none">＋</span>{" "}
                            {activeTab === "Coaches" ? "Add Coach" : "Add Sub-Admin"}
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <nav className="mt-5 flex gap-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="px-6 py-8 md:px-8">
                {/* ─── OVERVIEW TAB ─── */}
                {activeTab === "Overview" && (
                    <div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard label="Total Sub-Admins" value={subAdmins.length} color="text-indigo-600" bg="bg-indigo-50" />
                            <StatCard
                                label="Active Sub-Admins"
                                value={subAdmins.filter((s) => s.status === "ACTIVE").length}
                                color="text-emerald-600"
                                bg="bg-emerald-50"
                            />
                            <StatCard label="Total Coaches" value={coaches.length} color="text-amber-600" bg="bg-amber-50" />
                            <StatCard
                                label="Active Coaches"
                                value={coaches.filter((c) => c.status === "ACTIVE").length}
                                color="text-sky-600"
                                bg="bg-sky-50"
                            />
                        </div>

                        {/* Quick Action Cards */}
                        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div
                                onClick={() => setActiveTab("Sub-Admins")}
                                className="cursor-pointer rounded-xl border border-indigo-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
                            >
                                <h3 className="text-base font-semibold text-gray-800">Manage Sub-Admins</h3>
                                <p className="mt-1 text-sm text-gray-500">View, create and manage sub-admin accounts.</p>
                                <p className="mt-4 text-2xl font-bold text-indigo-600">{subAdmins.length} total</p>
                            </div>
                            <div
                                onClick={() => setActiveTab("Coaches")}
                                className="cursor-pointer rounded-xl border border-emerald-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
                            >
                                <h3 className="text-base font-semibold text-gray-800">Manage Coaches</h3>
                                <p className="mt-1 text-sm text-gray-500">View, create and manage coach accounts.</p>
                                <p className="mt-4 text-2xl font-bold text-emerald-600">{coaches.length} total</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── SUB-ADMINS TAB ─── */}
                {activeTab === "Sub-Admins" && (
                    <AccountTable
                        title="Sub-Admin Accounts"
                        rows={subAdmins}
                        isPending={isPending}
                        emptyMessage='No sub-admins yet. Click "Add Sub-Admin" to create one.'
                        accentColor="indigo"
                    />
                )}

                {/* ─── COACHES TAB ─── */}
                {activeTab === "Coaches" && (
                    <AccountTable
                        title="Coach Accounts"
                        rows={coaches}
                        isPending={isPending}
                        emptyMessage='No coaches yet. Click "Add Coach" to create one.'
                        accentColor="emerald"
                    />
                )}
            </div>

            {/* ─── SLIDE-IN PANEL ─── */}
            {showPanel && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="flex-1 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowPanel(false)}
                    />
                    <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">{panelTitle}</h2>
                            <button
                                onClick={() => setShowPanel(false)}
                                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {activeTab === "Coaches" ? (
                                <CreateCoachForm onSuccess={handleSuccess} />
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

function StatCard({ label, value, color, bg }) {
    return (
        <div className={`rounded-xl ${bg} border border-gray-100 p-6 shadow-sm`}>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function AccountTable({ title, rows, isPending, emptyMessage, accentColor }) {
    const badge = {
        ACTIVE: "bg-green-100 text-green-700",
        BLOCKED: "bg-red-100 text-red-700",
    };

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">{title}</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {isPending ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">Loading…</div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <p className="text-base">{emptyMessage}</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-6 py-3 text-left">#</th>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">University ID</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row, i) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{row.universityId}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[row.status] || ""}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
