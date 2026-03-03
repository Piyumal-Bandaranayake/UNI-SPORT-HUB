"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function login(formData) {
    const { universityId, password } = formData;

    if (!universityId || !password) {
        return { error: "Both fields are required" };
    }

    try {
        // redirectTo triggers a NEXT_REDIRECT which must be re-thrown
        await signIn("credentials", {
            universityId,
            password,
            redirectTo: "/dashboard",
        });
    } catch (error) {
        // NEXT_REDIRECT is not an AuthError — re-throw it so Next.js handles navigation
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid University ID or Password" };
                default:
                    return { error: "Authentication failed. Check your ID and password." };
            }
        }
        if (error?.message?.includes("BLOCKED")) {
            return { error: "Your account has been blocked. Contact admin." };
        }
        // Re-throw everything else (including NEXT_REDIRECT)
        throw error;
    }
}
