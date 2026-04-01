import dbConnect from "@/lib/mongodb";
import SportRequest from "@/models/SportRequest";
import Student from "@/models/Student";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // 1. Fetch pending sport requests
        const pendingSportRequests = await SportRequest.find({ status: "PENDING" })
            .populate("studentId", "name universityId")
            .populate("sportId", "name")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // 2. Fetch recently registered students (last 24 hours)
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);
        const recentStudents = await Student.find({ 
            createdAt: { $gte: yesterday } 
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

        const notifications = [
            ...pendingSportRequests.map(r => ({
                id: r._id.toString(),
                type: "SPORT_REQUEST",
                title: "New Sport Enrollment Request",
                message: `${r.studentId?.name || "A student"} wants to join ${r.sportId?.name || "a sport"}.`,
                time: r.createdAt,
                data: {
                    studentId: r.studentId?._id,
                    sportId: r.sportId?._id
                }
            })),
            ...recentStudents.map(s => ({
                id: s._id.toString(),
                type: "STUDENT_REGISTER",
                title: "New Student Registered",
                message: `${s.name} (${s.universityId}) has created an account.`,
                time: s.createdAt,
                data: {
                    studentId: s._id
                }
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time));

        return NextResponse.json(notifications);
    } catch (err) {
        console.error("fetchNotifications API error:", err);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
