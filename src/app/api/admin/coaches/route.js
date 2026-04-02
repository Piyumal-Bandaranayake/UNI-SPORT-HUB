import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import Student from "@/models/Student";
import Sport from "@/models/Sport";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { sendLoginDetails, sendAccountStatusEmail } from "@/lib/mail";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized: Only admins can create coaches." }, { status: 401 });
        }

        const { name, email, password, confirmPassword } = await req.json();
        
        if (!name || !email || !password || !confirmPassword) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
        }

        const trimmedEmail = email.trim();
        await dbConnect();

        // Cross-check across ALL roles and identifiers
        const checks = [
            { model: Admin, field: "universityId" },
            { model: SubAdmin, field: "email" },
            { model: Coach, field: "email" },
            { model: Student, field: "universityId" },
            { model: Student, field: "universityEmail" }
        ];

        for (const { model, field } of checks) {
            const existing = await model.findOne({ 
                [field]: { $regex: new RegExp("^" + trimmedEmail + "$", "i") } 
            });
            if (existing) {
                return NextResponse.json({ 
                    error: `The Email "${trimmedEmail}" is already registered in our system.` 
                }, { status: 400 });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Proactive Dispatch: Verify email delivery before final creation
        const emailStatus = await sendLoginDetails(trimmedEmail, name, "COACH", password);
        
        if (!emailStatus.success) {
            return NextResponse.json({ 
                error: "Your email is not valid. Please enter a correct email address to continue." 
            }, { status: 400 });
        }

        const newCoach = await Coach.create({ name, email: trimmedEmail, passwordHash });

        return NextResponse.json({ success: `Coach "${name}" created successfully. Login details sent to email.`, data: newCoach }, { status: 201 });
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
        const [coaches, sports] = await Promise.all([
            Coach.find({}, "name email status assignedSports createdAt").lean(),
            Sport.find({}, "name").lean()
        ]);

        const validSportNames = sports.map(s => s.name);

        const formatted = coaches.map((c) => ({
            id: c._id.toString(),
            name: c.name,
            email: c.email,
            status: c.status,
            assignedSports: (c.assignedSports || []).filter(sport => validSportNames.includes(sport)),
            createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
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

export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();
        if (!id) return NextResponse.json({ error: "Coach ID is required" }, { status: 400 });

        await dbConnect();
        const updated = await Coach.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: "after" }
        );

        if (!updated) return NextResponse.json({ error: "Coach not found" }, { status: 404 });

        // Email notification
        if (status) {
            await sendAccountStatusEmail(updated.email, updated.name, "COACH", status);
        }

        return NextResponse.json({ success: "Coach status updated", data: updated });
    } catch (err) {
        console.error("updateCoach API error:", err);
        return NextResponse.json({ error: "Failed to update coach status" }, { status: 500 });
    }
}
