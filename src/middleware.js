import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

    // ── Token expiry guard ────────────────────────────────────────────────────
    // If the user has an active session but the 1-hour token has expired,
    // treat them as logged-out and send them back to login.
    if (isLoggedIn && req.auth?.tokenExpiry) {
        const nowSeconds = Math.floor(Date.now() / 1000);
        if (nowSeconds > req.auth.tokenExpiry) {
            // Redirect to login; the expired cookie will be cleared by NextAuth
            const loginUrl = new URL("/login", nextUrl);
            loginUrl.searchParams.set("reason", "session_expired");
            return NextResponse.redirect(loginUrl);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (isAuthPage && isLoggedIn) {
        // Already logged in, redirect away from auth pages to their dashboard
        const role = req.auth.user.role.toLowerCase().replace(/_/g, '-');
        return NextResponse.redirect(new URL(`/dashboard/${role}`, nextUrl));
    }

    if (isDashboardRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (isDashboardRoute && isLoggedIn) {
        const isDashboardRoot = nextUrl.pathname === "/dashboard";

        // Allow /dashboard root through — dashboard/page.jsx handles role redirect
        if (!isDashboardRoot) {
            const role = req.auth.user.role.toLowerCase().replace(/_/g, "-");
            const roleMatch = nextUrl.pathname.startsWith(`/dashboard/${role}`);

            if (!roleMatch) {
                return NextResponse.redirect(new URL("/unauthorized", nextUrl));
            }
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
