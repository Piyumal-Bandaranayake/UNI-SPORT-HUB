"use server";

import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function createCoach(formData) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return { error: "Unauthorized: Only admins can create coaches." };
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

        // Cross-collection uniqueness check
        const models = [Admin, SubAdmin, Coach, Student];
        for (const model of models) {
            const existing = await model.findOne({ universityId });
            if (existing) {
                return { error: `University ID "${universityId}" is already registered.` };
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await Coach.create({ name, universityId, passwordHash });

        return { success: `Coach "${name}" created successfully.` };
    } catch (err) {
        console.error("createCoach error:", err);
        return { error: "Something went wrong. Please try again." };
    }
}

export async function getCoaches() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return [];

    await dbConnect();
    const coaches = await Coach.find({}, "name universityId status assignedSports createdAt").lean();
    return coaches.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        universityId: c.universityId,
        status: c.status,
        assignedSports: c.assignedSports,
        createdAt: c.createdAt.toISOString(),
    }));
}
