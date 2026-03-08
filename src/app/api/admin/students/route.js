import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Admin from "@/models/Admin";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const students = await Student.find({}, "-passwordHash").sort({ createdAt: -1 }).lean();

        const formatted = students.map((s) => ({
            id: s._id.toString(),
            name: s.name,
            universityId: s.universityId,
            universityEmail: s.universityEmail,
            status: s.status,
            approvedSports: s.approvedSports || [],
            sportRequests: s.sportRequests || [],
            createdAt: s.createdAt.toISOString(),
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("getStudents API error:", err);
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, name, universityId, universityEmail, status } = await req.json();
        if (!id) return NextResponse.json({ error: "Student ID is required" }, { status: 400 });

        await dbConnect();

        // Check for conflicts if IDs/Emails are changed
        if (universityId) {
            const models = [Admin, SubAdmin, Coach, Student];
            for (const model of models) {
                const existing = await model.findOne({ universityId, _id: { $ne: id } });
                if (existing) {
                    return NextResponse.json({ error: `University ID "${universityId}" already in use.` }, { status: 400 });
                }
            }
        }

        const updated = await Student.findByIdAndUpdate(
            id,
            { name, universityId, universityEmail, status },
            { new: true }
        );

        if (!updated) return NextResponse.json({ error: "Student not found" }, { status: 404 });

        return NextResponse.json({ success: "Student updated successfully", data: updated });
    } catch (err) {
        console.error("updateStudent API error:", err);
        return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await dbConnect();
        const deleted = await Student.findByIdAndDelete(id);

        if (!deleted) return NextResponse.json({ error: "Student not found" }, { status: 404 });

        return NextResponse.json({ success: "Student removed successfully" });
    } catch (err) {
        console.error("deleteStudent API error:", err);
        return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
    }
}
