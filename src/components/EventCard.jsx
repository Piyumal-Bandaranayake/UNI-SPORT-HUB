"use client";

export default function EventCard({ event }) {
  const { name, date, time, location, type, status, image, description } = event;

  const typeColors = {
    TRAINING: "bg-blue-100 text-blue-600",
    MATCH: "bg-red-100 text-red-600",
    TOURNAMENT: "bg-amber-100 text-amber-600",
    MEETING: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="aspect-[16/9] overflow-hidden bg-gray-100 relative">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
             <span className="text-4xl">🏆</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${typeColors[type] || "bg-indigo-100 text-indigo-600"}`}>
            {type}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 text-xs font-bold text-indigo-500 uppercase tracking-tighter mb-3">
          <span className="flex items-center gap-1">
            <span className="text-lg">📅</span> {date}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="flex items-center gap-1">
            <span className="text-lg">⏰</span> {time}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <span className="text-lg">📍</span> {location}
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-6">
          {description || "Join us for this exciting university sports event and show your support!"}
        </p>

        <button className="w-full py-3 rounded-xl bg-gray-50 text-gray-900 text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all">
          View Details
        </button>
      </div>
    </div>
  );
}
