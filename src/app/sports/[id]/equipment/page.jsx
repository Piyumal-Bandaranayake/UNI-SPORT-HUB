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
            {/* Hero Section */}
            <div className="relative h-[350px] w-full overflow-hidden">
                {sport.image ? (
                    <img
                        src={sport.image}
                        alt={sport.name}
                        className="w-full h-full object-cover scale-110 blur-[2px] opacity-90 transition-all duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-9xl font-black text-white/20 uppercase tracking-tighter">
                            {sport.name.substring(0, 2)}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-black/40 to-black/60"></div>
                
                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-6 w-full pt-12">
                        <Link 
                            href={`/sports/${id}`} 
                            className="text-white/70 hover:text-white mb-8 inline-flex items-center gap-2 text-sm font-bold transition-all group backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/20"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to {sport.name}
                        </Link>
                        
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                            <div className="animate-fade-in-down">
                                <span className="inline-block bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-indigo-500/30">Official Gear</span>
                                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                                    EQUIPMENT <span className="text-indigo-400">RENTAL</span>
                                </h1>
                                <p className="mt-4 text-white/80 text-lg max-w-2xl font-medium leading-relaxed">
                                    Browse and book available {sport.name} gear for your next practice or match. Premium quality equipment for registered athletes.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4 bg-white p-6 rounded-[32px] border border-white/20 shadow-2xl backdrop-blur-xl animate-fade-in scale-100 hover:scale-105 transition-transform duration-300">
                                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-200">
                                    🏸
                                </div>
                                <div className="pr-4">
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1.5">Inventory Status</div>
                                    <div className="text-2xl font-black text-gray-900 leading-none">{equipments.length} <span className="text-indigo-600 text-sm font-bold ml-1 uppercase">Available</span></div>
                                </div>
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
            {/* In-page animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .animate-fade-in-down {
                    animation: fadeInDown 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}} />
        </div>
    );
}
