import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import Link from "next/link";
import { notFound } from "next/navigation";
import JoinSportSection from "@/components/JoinSportSection";

export const dynamic = "force-dynamic";

export default async function SportProfile({ params }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await dbConnect();
    const session = await auth();

    let sport = null;
    try {
        sport = await Sport.findById(id).lean();
        if (!sport && id) {
            sport = await Sport.findOne({ name: { $regex: new RegExp(`^${id}$`, 'i') } }).lean();
        }
    } catch (err) {
        console.error(`[SportProfile] Database error for ID ${id}:`, err.message);
    }

    if (!sport) notFound();

    const actions = [
        {
            icon: "🏸",
            title: "Equipment Rental",
            desc: "Borrow rackets, balls, and other essential sports gear for your sessions.",
            price: "Deposit Required",
            tag: "Gear",
            tagColor: "bg-amber-50 text-amber-600",
            accentColor: "from-amber-500 to-orange-500",
            href: `/sports/${id}/equipment`,
        },
        {
            icon: "🏟️",
            title: "Court Booking",
            desc: "Reserve your spot on the court for practice sessions or competitive matches.",
            price: "Free for Students",
            tag: "Venue",
            tagColor: "bg-emerald-50 text-emerald-600",
            accentColor: "from-emerald-500 to-teal-500",
            href: `/sports/${id}/court`,
        },
    ];

    const stats = [
        { label: "Active Members", value: "200+", icon: "👥" },
        { label: "Matches / Year", value: "50+", icon: "🏆" },
        { label: "Training Days", value: "5/wk", icon: "🗓️" },
        { label: "Facilities", value: "3", icon: "🏟️" },
    ];

    return (
        <div className="min-h-screen bg-[#F4F6FB]">
            {/* ── HERO ── */}
            <div className="relative h-[480px] w-full overflow-hidden">
                {sport.image ? (
                    <img src={sport.image} alt={sport.name} className="w-full h-full object-cover scale-105" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                        <span className="text-[12rem] font-black text-white/10 uppercase tracking-tighter select-none">
                            {sport.name.substring(0, 2)}
                        </span>
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                {/* Subtle radial glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 via-transparent to-transparent" />

                {/* Hero content */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-12">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold transition-colors group"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            All Sports
                        </Link>
                    </div>

                    <div className="max-w-4xl">
                        {sport.category && (
                            <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-indigo-500/30">
                                {sport.category}
                            </span>
                        )}
                        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-none mb-4 drop-shadow-2xl">
                            {sport.name}
                        </h1>
                        <p className="text-white/75 text-base sm:text-lg max-w-2xl font-medium leading-relaxed">
                            {sport.description || "Join our university team and compete in inter-university tournaments, friendly matches, and regular training sessions."}
                        </p>

                        {/* Stat pills */}
                        <div className="flex flex-wrap gap-3 mt-6">
                            {stats.map(s => (
                                <div key={s.label} className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2">
                                    <span className="text-sm">{s.icon}</span>
                                    <span className="text-white font-black text-sm">{s.value}</span>
                                    <span className="text-white/50 text-xs font-medium">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* ── LEFT / MAIN ── */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Booking section label */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-black text-gray-900">Booking & Reservations</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {actions.map(action => (
                                    <Link key={action.title} href={action.href} className="group block">
                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
                                            {/* Card top accent gradient */}
                                            <div className={`h-1.5 bg-gradient-to-r ${action.accentColor}`} />
                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-start justify-between mb-5">
                                                    <div className="w-14 h-14 bg-indigo-50 group-hover:bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300">
                                                        {action.icon}
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${action.tagColor}`}>
                                                        {action.tag}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{action.title}</h3>
                                                <p className="text-gray-400 text-sm font-medium leading-relaxed flex-1">{action.desc}</p>
                                                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                                                    <span className="text-sm font-black text-indigo-600">{action.price}</span>
                                                    <span className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 group-hover:text-indigo-600 uppercase tracking-widest transition-colors">
                                                        Book Now
                                                        <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* About section */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-black text-gray-900">About {sport.name}</h2>
                            </div>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                {sport.description || `${sport.name} is one of our university's premier sports programs. We welcome all skill levels — from beginners to competitive athletes — to train, improve, and represent the university in inter-university tournaments. Our coaching staff provides expert guidance and regular sessions for all team members.`}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                                {stats.map(s => (
                                    <div key={s.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                                        <div className="text-xl mb-1">{s.icon}</div>
                                        <div className="text-lg font-black text-gray-900">{s.value}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <div className="space-y-5">
                        {/* Join section */}
                        <JoinSportSection sportId={id} session={session} />

                        {/* Quick contact card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h4 className="font-black text-gray-900 text-sm mb-4 flex items-center gap-2">
                                <span className="text-base">💬</span> Quick Contact
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-base shrink-0">📧</div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Email</div>
                                        <div className="text-sm font-bold text-gray-900 truncate">{sport.name.toLowerCase().replace(/\s+/g, "")}@uni.edu</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center text-base shrink-0">📞</div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Extension</div>
                                        <div className="text-sm font-bold text-gray-900">+94 112 345 678</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick links card */}
                        <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-700 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30 blur-2xl pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Ready to play?</p>
                                <h4 className="font-black text-lg text-white mb-4">Get started today</h4>
                                <div className="space-y-2.5">
                                    <Link href={`/sports/${id}/equipment`} className="flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl px-4 py-3 transition-all group">
                                        <span className="text-sm font-bold text-white flex items-center gap-2"><span>🏸</span> Rent Equipment</span>
                                        <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </Link>
                                    <Link href={`/sports/${id}/court`} className="flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl px-4 py-3 transition-all group">
                                        <span className="text-sm font-bold text-white flex items-center gap-2"><span>🏟️</span> Book a Court</span>
                                        <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
