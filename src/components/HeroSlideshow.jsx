"use client";

export default function HeroSlideshow() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>
      <img
        src="/images/hero_main.png"
        alt="Hero Wallpaper"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
