import Link from "next/link";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import Event from "@/models/Event";
import Achievement from "@/models/Achievement";
import HeroSlideshow from "@/components/HeroSlideshow";
import EventCard from "@/components/EventCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  await dbConnect();
  const sports = JSON.parse(JSON.stringify(await Sport.find({ status: "ACTIVE" }).lean()));
  const events = JSON.parse(JSON.stringify(await Event.find({ status: { $in: ["UPCOMING", "LIVE"] } })
    .sort({ date: 1 })
    .limit(4)
    .lean()));


  const achievements = JSON.parse(JSON.stringify(await Achievement.find({})
    .sort({ createdAt: -1 })
    .limit(3)
    .lean()));


  console.log(`[Home] Fetched ${sports.length} sports, ${events.length} events, and ${achievements.length} achievements.`);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center min-h-[80vh] overflow-hidden">
        <HeroSlideshow />

        <div className="relative z-10 max-w-4xl px-6 py-12">
          <h1 className="text-6xl font-black tracking-tight text-white sm:text-8xl drop-shadow-2xl">
            University <span className="text-indigo-400">Sports Hub</span>
          </h1>
          <p className="mt-10 text-xl text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-lg font-medium">
            The all-in-one platform for managing university sports activities,
            equipment, and schedules. Unified, organized, and built for excellence.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!session ? (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-900/50 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-200"
                >
                  Login to Portal
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-bold text-white hover:bg-white/20 transition-all duration-200"
                >
                  Register as Student
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-900/50 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-200"
              >
                Go to My Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>



      {/* Sports Section */}
      <div id="sports" className="py-24 bg-white relative overflow-hidden">
        {/* Bright Background Decorations */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[700px] h-[700px] bg-indigo-100 rounded-full blur-[120px] opacity-100 pointer-events-none transition-all duration-1000 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-sky-100/60 rounded-full blur-[100px] opacity-100 pointer-events-none transition-all duration-1000"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 relative">
            <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
              Explore Our Campus
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Featured <span className="text-indigo-600">Sports</span>
            </h2>
            <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Discover the diverse range of athletic opportunities available at our university. 
              Join a team, excel in your sport, and represent our excellence.
            </p>
          </div>

          {sports.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
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

      {/* Events Section */}
      <div id="events" className="py-24 bg-white relative overflow-hidden">
        {/* Top Fade for Brightness */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none"></div>
        
        {/* Highly Vibrant Background Decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2)_0%,transparent_60%)] pointer-events-none scale-150"></div>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-100/60 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-50/80 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 relative">
            <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
              Don't Miss Out
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Upcoming <span className="text-indigo-600">Events</span>
            </h2>
            <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Stay updated with the latest training sessions, matches, and tournaments. 
              Be there to cheer for your teams!
            </p>
          </div>

          {events.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic">No upcoming events scheduled at this moment. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {events.map((event) => (
                  <EventCard key={event._id.toString()} event={event} />
                ))}
              </div>
              
              <div className="mt-16 text-center">
                <button className="px-10 py-4 rounded-xl border-2 border-indigo-50 bg-white text-indigo-600 font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-lg shadow-indigo-50">
                  Explore Full Calendar →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      <div id="achievements" className="py-24 bg-gray-50/30 relative overflow-hidden">
        {/* Artistic Background Components */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-amber-50 rounded-full blur-[100px] opacity-100 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-sky-50 rounded-full blur-[100px] opacity-100 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 relative">
            <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-amber-600 uppercase bg-amber-50 rounded-full">
              Championship DNA
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Achievements & <span className="text-amber-500">Glory</span>
            </h2>
            <div className="h-1.5 w-20 bg-amber-500 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Celebrating the excellence, hard work, and triumphs of our university athletes. 
              Witness the history of our sporting success.
            </p>
          </div>

          {achievements.length === 0 ? (
             <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-amber-100">
               <div className="text-4xl mb-4">🏆</div>
               <p className="text-gray-400 font-medium italic">New records are currently being written. Stay tuned!</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {achievements.map((ach) => (
                <div 
                  key={ach._id.toString()} 
                  className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-amber-100/30 transition-all duration-500 group flex flex-col items-center text-center p-2"
                >
                  <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[28px] overflow-hidden mb-6">
                    <img 
                      src={ach.image} 
                      alt={ach.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 left-4">
                       <span className="bg-white/90 backdrop-blur-md text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-amber-600 shadow-sm border border-amber-100">
                         {ach.sportName}
                       </span>
                    </div>
                  </div>
                  <div className="px-6 pb-8">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2">Achieved on {ach.date}</div>
                    <h4 className="text-xl font-black text-gray-900 mb-3 group-hover:text-amber-500 transition-colors leading-tight">{ach.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed italic line-clamp-3">"{ach.description}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
