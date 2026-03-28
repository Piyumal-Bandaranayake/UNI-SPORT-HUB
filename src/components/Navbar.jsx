"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Hide navbar on specific routes
    if (pathname?.startsWith("/dashboard") || pathname === "/login" || pathname === "/register") return null;

    return (
        <nav
            className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
                ? "top-4 mx-auto max-w-5xl rounded-full bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-100/40 border border-white/50 px-8 h-16 py-2"
                : "top-0 w-full bg-transparent h-24 py-6 px-4 md:px-12"
                }`}
        >
            <div className="mx-auto flex h-full w-full items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <img src="/images/unisporthub_logo.png" alt="UniSportHub" className={`w-10 h-10 object-contain transition-all duration-300 ${isScrolled ? "scale-90" : "scale-110"}`} />
                        <span className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${isScrolled ? "text-gray-900" : "text-white drop-shadow-md"}`}>
                            Uni<span className="text-indigo-500">Sport</span>Hub
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="hidden lg:flex items-center gap-10">
                    {[
                        { name: "Home", href: "/" },
                        { name: "Sports", href: "/#sports" },
                        { name: "Events", href: "/#events" },
                    ].map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`text-sm font-bold uppercase tracking-widest transition-all duration-300 relative group overflow-hidden ${
                                isScrolled ? "text-gray-600 hover:text-indigo-600" : "text-white/90 hover:text-white"
                            }`}
                        >
                            {item.name}
                            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left`}></span>
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    {session ? (
                        <div className="flex items-center gap-4">


                            <Link
                                href="/dashboard" 
                                className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                                    isScrolled 
                                    ? "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600" 
                                    : "text-white/90 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    isScrolled ? "border-indigo-100 bg-indigo-50 group-hover:bg-indigo-100" : "border-white/20 bg-white/10 group-hover:bg-white/20"
                                }`}>
                                    <svg className={`w-3 h-3 ${isScrolled ? "text-indigo-600" : "text-white"}`} fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">Profile</span>
                            </Link>

                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                                    isScrolled 
                                    ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100" 
                                    : "bg-white/10 text-white-50 border border-white/20 backdrop-blur-md hover:bg-white/20"
                                }`}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-8">
                            <Link
                                href="/login"
                                className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${isScrolled ? "text-gray-900 hover:text-indigo-600" : "text-white hover:text-indigo-200"}`}
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className={`rounded-full px-8 py-3 text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-xl ${isScrolled
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                                    : "bg-white text-indigo-600 hover:bg-indigo-50 shadow-black/10 hover:-translate-y-1"
                                    }`}
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
