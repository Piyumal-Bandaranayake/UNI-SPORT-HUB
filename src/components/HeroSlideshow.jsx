"use client";

import { useState, useEffect } from "react";

const images = [
  "/images/hero11.jpg",
  "/images/hero12.jpg",
  "/images/hero13.jpg"
];

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Hero Slide ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
