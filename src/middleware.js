import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth") ||
        req.nextUrl.pathname.startsWith("/login") ||
        req.nextUrl.pathname.startsWith("/signup")

    // Protect routes here if needed
    // Example: if (!isLoggedIn && !isAuthRoute) return Response.redirect(new URL("/login", req.nextUrl))
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
