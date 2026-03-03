"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/70 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-black tracking-tight text-gray-900">
                            Uni<span className="text-indigo-600">Sport</span>Hub
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden text-sm font-medium text-gray-600 sm:block">
                                {session.user.name} ({session.user.role})
                            </span>
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
