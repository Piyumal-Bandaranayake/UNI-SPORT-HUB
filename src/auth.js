import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import Student from "@/models/Student";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                universityId: { label: "University ID", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await dbConnect();

                const { universityId, password } = credentials;

                // AUTHENTICATION ORDER: Admin -> SubAdmin -> Coach -> Student
                const models = [
                    { model: Admin, role: "ADMIN" },
                    { model: SubAdmin, role: "SUB_ADMIN" },
                    { model: Coach, role: "COACH" },
                    { model: Student, role: "STUDENT" },
                ];

                let userFound = null;
                let userRole = null;

                for (const item of models) {
                    let user;
                    
                    if (item.role === "SUB_ADMIN" || item.role === "COACH") {
                        // Staff log in with their email
                        user = await item.model.findOne({ email: universityId });
                    } else if (item.role === "STUDENT") {
                        // Students can log in with ID OR Email
                        user = await item.model.findOne({ 
                            $or: [
                                { universityId: universityId },
                                { universityEmail: universityId }
                            ] 
                        });
                    } else {
                        // Admins log in with their University ID
                        user = await item.model.findOne({ universityId });
                    }
                    
                    if (user) {
                        userFound = user;
                        userRole = item.role;
                        break;
                    }
                }

                if (!userFound) {
                    throw new Error("Invalid University ID or Password");
                }

                if (userFound.status === "BLOCKED") {
                    throw new Error("User account is blocked");
                }

                const isPasswordCorrect = await bcrypt.compare(password, userFound.passwordHash);
                if (!isPasswordCorrect) {
                    throw new Error("Invalid University ID or Password");
                }

                return {
                    id: userFound._id.toString(),
                    name: userFound.name,
                    universityId: userFound.universityId || userFound.universityEmail || userFound.email,
                    universityEmail: userFound.universityEmail || userFound.email,
                    role: userRole,
                };
            },
        }),
    ],
});
