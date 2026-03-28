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

    if (!session || !session.user || session.user.role !== "student") {
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
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header / Hero */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Link href={`/sports/${id}`} className="text-gray-400 hover:text-indigo-600 mb-4 inline-flex items-center gap-2 text-sm font-medium transition-colors">
                        ← Back to {sport.name}
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">
                            🏟️
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                                Court Reservation
                            </h1>
                            <p className="text-gray-500 font-medium">Book courts for specific sports</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <CourtBookingClient sport={serializedSport} user={session.user} />
        </div>
    );
}
