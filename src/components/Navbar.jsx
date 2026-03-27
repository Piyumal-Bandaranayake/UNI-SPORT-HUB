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
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled
                ? "bg-white/80 backdrop-blur-lg shadow-sm h-16 py-2 border-b border-gray-100"
                : "bg-transparent h-20 py-4"
                }`}
        >
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <span className="text-2xl font-black tracking-tight text-gray-900">
                            Uni<span className="text-indigo-600 transition-colors group-hover:text-indigo-400">Sport</span>Hub
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden text-sm font-medium text-gray-600 sm:block">
                                {session.user.name}
                                <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                                    {session.user.role}
                                </span>
                            </span>
                            <Link
                                href="/dashboard"
                                className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-200 focus:outline-none"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link
                                href="/login"
                                className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 ${isScrolled
                                    ? "bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700"
                                    : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
                                    }`}
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
