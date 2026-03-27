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
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <Link 
                        href={`/sports/${id}`} 
                        className="text-gray-500 hover:text-indigo-600 mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to {sport.name}
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase">
                                Equipment <span className="text-indigo-600">Rental</span>
                            </h1>
                            <p className="mt-4 text-gray-500 text-lg max-w-2xl font-medium">
                                Browse and book available {sport.name} gear for your next practice or match.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100/50">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-indigo-200">
                                🏸
                            </div>
                            <div>
                                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-none mb-1">Total Items</div>
                                <div className="text-xl font-black text-indigo-900 leading-none">{equipments.length} Available</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Component for Interactive Equipment List & Booking */}
            <EquipmentBookingClient 
                equipments={equipments} 
                user={session?.user} 
            />

            {/* Sticky Footnote/Safety Info */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <h4 className="text-xl font-bold mb-2">Equipment Care Policy</h4>
                            <p className="text-indigo-200 text-sm">
                                All borrowed equipment must be returned in the same condition. A deposit might be required for premium gear. Please report any damages immediately to the coach.
                            </p>
                        </div>
                        <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors shrink-0">
                            Read Full Terms
                        </button>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}
