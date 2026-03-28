"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    if (pathname?.startsWith("/dashboard") || pathname === "/login" || pathname === "/register") return null;
    return (
        <footer className="bg-[#0F172A] border-t border-white/5 py-16 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-10 sm:flex-row pb-12 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <img src="/images/unisporthub_logo.png" alt="UniSportHub Logo" className="w-12 h-12 object-contain" />
                        <span className="text-2xl font-black tracking-tighter text-white">
                            Uni<span className="text-indigo-400">Sport</span>Hub
                        </span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-bold text-gray-400">
                        <Link href="/" className="hover:text-indigo-400 transition-colors uppercase tracking-widest">Home</Link>
                        <Link href="/about" className="hover:text-indigo-400 transition-colors uppercase tracking-widest">About</Link>
                        <Link href="/privacy" className="hover:text-indigo-400 transition-colors uppercase tracking-widest">Privacy</Link>
                        <Link href="/contact" className="hover:text-indigo-400 transition-colors uppercase tracking-widest">Contact</Link>
                    </nav>


                </div>
                
                <div className="pt-12 text-center text-sm text-gray-500 font-medium" suppressHydrationWarning>
                    © {new Date().getFullYear()} UniSportHub. The all-in-one university sports management excellence platform.
                </div>
            </div>
        </footer>
    );
}
