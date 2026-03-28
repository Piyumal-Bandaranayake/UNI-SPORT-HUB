import dbConnect from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import Student from "@/models/Student";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const student = await Student.findById(session.user.id);
        if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

        // Fetch schedules matching any of the student's approved sports (by name or ID if linked)
        // Currently Schedule stores sportName.
        const schedules = await Schedule.find({
            sportName: { $in: student.approvedSports }
        }).sort({ date: 1, time: 1 }).lean();

        const formatted = schedules.map(s => ({
            id: s._id.toString(),
            sportName: s.sportName,
            date: s.date,
            time: s.time,
            location: s.location,
            activity: s.activity
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("GET training-schedules error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
