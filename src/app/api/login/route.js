import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { universityId, password } = await req.json();

        if (!universityId || !password) {
            return NextResponse.json({ error: "Both fields are required" }, { status: 400 });
        }

        // We use signIn from auth.js (Server Header)
        // Note: For NextAuth v5, calling signIn in a route handler is possible
        // but it doesn't return a "result" like the client-side one.
        // It's meant to be called in actions.
        // However, we can try-catch it.

        await signIn("credentials", {
            universityId,
            password,
            redirect: false, // Don't redirect automatically
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return NextResponse.json({ error: "Invalid University ID or Password" }, { status: 401 });
                default:
                    return NextResponse.json({ error: "Authentication failed. Check your ID and password." }, { status: 401 });
            }
        }

        if (error?.message?.includes("BLOCKED")) {
            return NextResponse.json({ error: "Your account has been blocked. Contact admin." }, { status: 403 });
        }

        // Check if it's a redirect error (success case in NextAuth)
        if (error.message === "NEXT_REDIRECT") {
            return NextResponse.json({ success: true });
        }

        console.error("Login API error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
