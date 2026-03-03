"use server";

import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Admin from "@/models/Admin";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import bcrypt from "bcryptjs";

export async function register(formData) {
    const { name, universityId, password, confirmPassword } = formData;

    if (!name || !universityId || !password || !confirmPassword) {
        return { error: "All fields are required" };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
    }

    if (password.length < 8) {
        return { error: "Password must be at least 8 characters long" };
    }

    try {
        await dbConnect();

        // Prevent duplicate universityId across ALL user collections
        const models = [Admin, SubAdmin, Coach, Student];
        for (const model of models) {
            const existingUser = await model.findOne({ universityId });
            if (existingUser) {
                return { error: "University ID is already registered" };
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            name,
            universityId,
            passwordHash: hashedPassword,
        });

        await newStudent.save();

        return { success: "Student registered successfully" };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Something went wrong. Please try again." };
    }
}
