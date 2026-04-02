import dbConnect from "@/lib/mongodb";
import SportRequest from "@/models/SportRequest";
import ExerciseSchedule from "@/models/ExerciseSchedule";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // 1. Fetch sport request updates for this student
        const sportRequests = await SportRequest.find({ 
            studentId: session.user.id,
            status: { $in: ["ACCEPTED", "REJECTED"] }
        })
        .populate("sportId", "name")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

        // 2. Fetch exercise session updates (maybe they were approved?)
        const exerciseRequests = await ExerciseSchedule.find({ 
            studentId: session.user.id,
            status: { $in: ["APPROVED", "REJECTED"] }
        })
        .populate("coachId", "name")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

        const notifications = [
            ...sportRequests.map(r => ({
                id: r._id.toString(),
                type: "SPORT_UPDATE",
                title: `Sport Enrollment ${r.status}`,
                message: `Your request to join ${r.sportId?.name || "a sport"} was ${r.status.toLowerCase()}.`,
                time: r.updatedAt,
            })),
            ...exerciseRequests.map(r => ({
                id: r._id.toString(),
                type: "EXERCISE_UPDATE",
                title: `Exercise Session ${r.status}`,
                message: `Your exercise session with Coach ${r.coachId?.name || "the coach"} was ${r.status.toLowerCase()}.`,
                time: r.updatedAt,
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time));

        return NextResponse.json(notifications);
    } catch (err) {
        console.error("fetchStudentNotifications API error:", err);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
