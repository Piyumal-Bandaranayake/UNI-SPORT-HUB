"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    if (pathname?.startsWith("/dashboard") || pathname === "/login" || pathname === "/register") return null;
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tighter text-gray-900">
                            Uni<span className="text-indigo-600">Sport</span>Hub
                        </span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-500">
                        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                        <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
                        <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                        <Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
                    </nav>

                    <div className="text-sm text-gray-400" suppressHydrationWarning>
                        © {new Date().getFullYear()} UniSportHub. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
