import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized: Only admins can create coaches." }, { status: 401 });
        }

        const { name, universityId, password, confirmPassword } = await req.json();

        if (!name || !universityId || !password || !confirmPassword) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
        }

        await dbConnect();

        // Cross-collection uniqueness check
        const models = [Admin, SubAdmin, Coach, Student];
        for (const model of models) {
            const existing = await model.findOne({ universityId });
            if (existing) {
                return NextResponse.json({ error: `University ID "${universityId}" is already registered.` }, { status: 400 });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newCoach = await Coach.create({ name, universityId, passwordHash });

        return NextResponse.json({ success: `Coach "${name}" created successfully.`, data: newCoach }, { status: 201 });
    } catch (err) {
        console.error("createCoach API error:", err);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const coaches = await Coach.find({}, "name universityId status assignedSports createdAt").lean();

        const formatted = coaches.map((c) => ({
            id: c._id.toString(),
            name: c.name,
            universityId: c.universityId,
            status: c.status,
            assignedSports: c.assignedSports,
            createdAt: c.createdAt.toISOString(),
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("getCoaches API error:", err);
        return NextResponse.json({ error: "Failed to fetch coaches" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await dbConnect();
        const deleted = await Coach.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: "Coach not found" }, { status: 404 });
        }

        return NextResponse.json({ success: "Coach removed successfully" });
    } catch (err) {
        console.error("deleteCoach API error:", err);
        return NextResponse.json({ error: "Failed to delete coach" }, { status: 500 });
    }
}
