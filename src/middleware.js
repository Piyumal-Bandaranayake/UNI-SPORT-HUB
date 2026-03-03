import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

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
