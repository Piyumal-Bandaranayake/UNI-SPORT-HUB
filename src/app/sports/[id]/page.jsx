import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SportProfile({ params }) {
    // Handling params specifically for Next.js 15+ promise based approach or fallback
    const resolvedParams = await params;
    const { id } = resolvedParams;

    console.log(`[SportProfile] Route accessed. Raw params:`, JSON.stringify(resolvedParams));
    console.log(`[SportProfile] ID to query: "${id}"`);

    await dbConnect();
    const session = await auth();

    let sport = null;
    try {
        // Double check the query format
        sport = await Sport.findById(id).lean();
        console.log(`[SportProfile] Query by findById("${id}") result:`, sport ? "FOUND" : "NULL");

        if (!sport && id) {
            // Fallback to findOne just in case
            sport = await Sport.findOne({ name: { $regex: new RegExp(`^${id}$`, 'i') } }).lean();
            console.log(`[SportProfile] Fallback query by name result:`, sport ? "FOUND" : "NULL");
        }
    } catch (err) {
        console.error(`[SportProfile] Database error for ID ${id}:`, err.message);
    }

    if (!sport) {
        console.log(`[SportProfile] Returning 404 for ID: ${id}`);
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Sport Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden">
                {sport.image ? (
                    <img
                        src={sport.image}
                        alt={sport.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-9xl font-black text-white/20 uppercase tracking-tighter">
                            {sport.name.substring(0, 2)}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="max-w-7xl mx-auto">
                        <Link href="/" className="text-white/60 hover:text-white mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors">
                            ← Back to Sports
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight uppercase">
                            {sport.name}
                        </h1>
                        <p className="mt-4 text-white/80 text-lg max-w-2xl font-medium">
                            {sport.description || "Join our university team and participate in inter-university tournaments, friendly matches, and regular training sessions."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Booking Options Section */}
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">📅</span>
                                Booking & Reservations
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <BookingCard
                                    icon="🏟️"
                                    title="Court Reservation"
                                    desc="Book a court for practice sessions or friendly matches."
                                    price="Free for Students"
                                    tag="Facility"
                                />
                                <BookingCard
                                    icon="🏸"
                                    title="Equipment Rental"
                                    desc="Borrow rackets, balls, and other essential sports gear."
                                    price="Deposit Required"
                                    tag="Gear"
                                    href={`/sports/${id}/equipment`}
                                />
                            </div>
                        </section>

                        {/* Description & Rules */}
                        <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">About the Department</h3>
                            <p className="text-gray-600 leading-relaxed">
                                The {sport.name} department is dedicated to fostering athletic excellence and team spirit.
                                We provide state-of-the-art facilities and professional coaching to help students excel in their chosen sport.
                                Whether you're a beginner or an advanced athlete, we have programs tailored to your needs.
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Coach</div>
                                    <div className="text-gray-900 font-bold">Available daily</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Equipment</div>
                                    <div className="text-gray-900 font-bold">Standard Gear</div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-indigo-100/20">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Interested in joining?</h3>
                            <p className="text-gray-500 text-sm mb-8">
                                Start your journey as a professional athlete in our university team.
                            </p>

                            {!session ? (
                                <Link
                                    href="/login"
                                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-center block hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    Login to Apply
                                </Link>
                            ) : (
                                <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-center block hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                    Send Join Request
                                </button>
                            )}

                            <p className="mt-6 text-center text-xs text-gray-400 font-medium">
                                Response typical within 24-48 hours
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4">Quick Contact</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">📧</div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Email</div>
                                        <div className="text-sm font-bold">{sport.name.toLowerCase()}@uni.edu</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">📞</div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Extension</div>
                                        <div className="text-sm font-bold">+94 112 345 678</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BookingCard({ icon, title, desc, price, tag, href }) {
    const CardContent = (
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 transition-all group cursor-pointer hover:-translate-y-1 h-full">
            <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    {icon}
                </div>
                <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {tag}
                </span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{title}</h4>
            <p className="text-gray-500 text-xs mb-6 line-clamp-2">{desc}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <span className="text-sm font-black text-indigo-600">{price}</span>
                <div className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    Book Now
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href}>
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}
