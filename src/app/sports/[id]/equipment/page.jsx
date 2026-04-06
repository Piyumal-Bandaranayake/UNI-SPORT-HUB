import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import Equipment from "@/models/Equipment";
import Link from "next/link";
import { notFound } from "next/navigation";
import EquipmentBookingClient from "@/components/EquipmentBookingClient";

export const dynamic = "force-dynamic";

export default async function EquipmentListing({ params }) {
    const { id } = await params;

    await dbConnect();
    const session = await auth();

    // Fetch Sport to verify it exists and get its name
    let sport = await Sport.findById(id).lean();
    if (!sport) {
        sport = await Sport.findOne({ name: { $regex: new RegExp(`^${id}$`, 'i') } }).lean();
    }

    if (!sport) {
        notFound();
    }

    // Fetch equipment for this sport
    const rawEquipments = await Equipment.find({ sportId: sport._id }).sort({ name: 1 }).lean();
    
    // Serialize MongoDB objects for Client Component
    const equipments = JSON.parse(JSON.stringify(rawEquipments));

    return (
        <div className="min-h-screen bg-[#F4F6FB]">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 40%)" }} />
                {/* Sport image as subtle bg overlay */}
                {sport.image && (
                    <div className="absolute inset-0 opacity-10">
                        <img src={sport.image} alt={sport.name} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                    <Link
                        href={`/sports/${id}`}
                        className="inline-flex items-center gap-2 text-indigo-300 hover:text-white text-sm font-semibold mb-6 transition-colors group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to {sport.name}
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-2xl border border-white/20">
                                🏸
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Equipment Rental</h1>
                                <p className="text-indigo-300 font-medium text-sm mt-0.5">Browse gear for <span className="text-white font-bold">{sport.name}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-3 self-start sm:self-auto">
                            <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-sm">{equipments.length}</div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Inventory</p>
                                <p className="text-white font-bold text-sm leading-none">{equipments.filter(e => e.available > 0).length} Available</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Equipment list */}
            <EquipmentBookingClient equipments={equipments} user={session?.user} />

            {/* Policy Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-7 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">📋</span>
                                <h4 className="text-base font-black">Equipment Care Policy</h4>
                            </div>
                            <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                                All borrowed equipment must be returned in the same condition. A deposit may be required for premium gear. Report any damages immediately to your coach.
                            </p>
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shrink-0">
                            Read Full Terms
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            ` }} />
        </div>
    );

}
