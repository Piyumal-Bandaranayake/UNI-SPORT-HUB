import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CourtBookingClient from "@/components/CourtBookingClient";

export const dynamic = "force-dynamic";

export default async function CourtBookingPage({ params }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await dbConnect();
    const session = await auth();

    const userRole = session?.user?.role?.toUpperCase();
    if (!session || !session.user || !["STUDENT", "SUB_ADMIN", "ADMIN"].includes(userRole)) {
        redirect("/login");
    }

    let sport = null;
    try {
        sport = await Sport.findById(id).lean();
        if (!sport) {
            sport = await Sport.findOne({ name: { $regex: new RegExp(`^${id}$`, 'i') } }).lean();
        }
    } catch (err) {
        console.error("Error fetching sport:", err);
    }

    if (!sport) {
        notFound();
    }

    // Convert ObjectId to string for client component props
    const serializedSport = {
        _id: sport._id.toString(),
        name: sport.name,
        category: sport.category || "",
        image: sport.image || ""
    };

    return (
        <div className="min-h-screen bg-[#F4F6FB]">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 40%)" }} />
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
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-2xl border border-white/20">
                            🏟️
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Court Reservation</h1>
                            <p className="text-indigo-300 font-medium text-sm mt-0.5">Book a court for <span className="text-white font-bold">{sport.name}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <CourtBookingClient sport={serializedSport} user={session.user} />
        </div>
    );

}
