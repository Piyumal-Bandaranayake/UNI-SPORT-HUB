"use server";

import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function createSubAdmin(formData) {
    // Only Admins can call this action
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return { error: "Unauthorized: Only admins can create sub-admins." };
    }

    const { name, universityId, password, confirmPassword } = formData;

    if (!name || !universityId || !password || !confirmPassword) {
        return { error: "All fields are required." };
    }

    if (password.length < 8) {
        return { error: "Password must be at least 8 characters." };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    try {
        await dbConnect();

        // Check uniqueness across ALL collections
        const models = [Admin, SubAdmin, Coach, Student];
        for (const model of models) {
            const existing = await model.findOne({ universityId });
            if (existing) {
                return { error: `University ID "${universityId}" is already registered.` };
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await SubAdmin.create({ name, universityId, passwordHash });

        return { success: `Sub-Admin "${name}" created successfully.` };
    } catch (err) {
        console.error("createSubAdmin error:", err);
        return { error: "Something went wrong. Please try again." };
    }
}

export async function getSubAdmins() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return [];

    await dbConnect();
    const subAdmins = await SubAdmin.find({}, "name universityId status createdAt").lean();
    // Convert ObjectId and Date to plain strings
    return subAdmins.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        universityId: s.universityId,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
    }));
}
