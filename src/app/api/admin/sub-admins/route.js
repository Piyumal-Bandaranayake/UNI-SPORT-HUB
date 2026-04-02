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
            return NextResponse.json({ error: "Unauthorized: Only admins can create sub-admins." }, { status: 401 });
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
        const emailStatus = await sendLoginDetails(trimmedEmail, name, "SUB_ADMIN", password);
        
        if (!emailStatus.success) {
            return NextResponse.json({ 
                error: "Your email is not valid. Please enter a correct email address to continue." 
            }, { status: 400 });
        }

        const newSubAdmin = await SubAdmin.create({ name, email: trimmedEmail, passwordHash });

        return NextResponse.json({ success: `Sub-Admin "${name}" created successfully. Login details sent to email.`, data: newSubAdmin }, { status: 201 });
    } catch (err) {
        console.error("createSubAdmin API error:", err);
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
        const [subAdmins, sports] = await Promise.all([
            SubAdmin.find({}, "name email status managedSports createdAt").lean(),
            Sport.find({}, "name").lean()
        ]);

        const validSportNames = sports.map(s => s.name);

        const formatted = subAdmins.map((s) => ({
            id: s._id.toString(),
            name: s.name,
            email: s.email,
            status: s.status,
            managedSports: (s.managedSports || []).filter(sport => validSportNames.includes(sport)),
            createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("getSubAdmins API error:", err);
        return NextResponse.json({ error: "Failed to fetch sub-admins" }, { status: 500 });
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
        const deleted = await SubAdmin.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: "Sub-Admin not found" }, { status: 404 });
        }

        return NextResponse.json({ success: "Sub-Admin removed successfully" });
    } catch (err) {
        console.error("deleteSubAdmin API error:", err);
        return NextResponse.json({ error: "Failed to delete sub-admin" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();
        if (!id) return NextResponse.json({ error: "Sub-Admin ID is required" }, { status: 400 });

        await dbConnect();
        const updated = await SubAdmin.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: "after" }
        );

        if (!updated) return NextResponse.json({ error: "Sub-Admin not found" }, { status: 404 });

        // Email notification
        if (status) {
            await sendAccountStatusEmail(updated.email, updated.name, "SUB_ADMIN", status);
        }

        return NextResponse.json({ success: "Sub-Admin status updated", data: updated });
    } catch (err) {
        console.error("updateSubAdmin API error:", err);
        return NextResponse.json({ error: "Failed to update sub-admin status" }, { status: 500 });
    }
}
