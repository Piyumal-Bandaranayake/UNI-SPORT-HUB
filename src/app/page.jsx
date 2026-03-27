import Link from "next/link";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  await dbConnect();
  const sports = await Sport.find({ status: "ACTIVE" }).lean();
  console.log(`[Home] Fetched ${sports.length} sports. Images present:`, sports.map(s => !!s.image));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-4xl">
          <h1 className="text-6xl font-black tracking-tight text-gray-900 sm:text-8xl">
            University <span className="text-indigo-600">Sports Hub</span>
          </h1>
          <p className="mt-10 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            The all-in-one platform for managing university sports activities,
            equipment, and schedules. Unified, organized, and built for excellence.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!session ? (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-200"
                >
                  Login to Portal
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto rounded-xl border-2 border-gray-100 bg-white px-8 py-4 text-lg font-bold text-gray-900 hover:bg-gray-50 hover:border-indigo-100 transition-all duration-200"
                >
                  Register as Student
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-200"
              >
                Go to My Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>



      {/* Sports Section */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Sports</h2>
            <p className="text-gray-500 mt-1">Explore available sports at our university</p>
          </div>
        </div>

        {sports.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium italic">No sports available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sports.map((sport) => (
              <Link
                key={sport._id.toString()}
                href={`/sports/${sport._id.toString()}`}
                className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                  {sport.image ? (
                    <img
                      src={sport.image}
                      alt={sport.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                      <span className="text-4xl font-black uppercase tracking-tighter">{sport.name.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {sport.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {sport.description || "Join our university team and participate in inter-university tournaments."}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Available</span>
                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

