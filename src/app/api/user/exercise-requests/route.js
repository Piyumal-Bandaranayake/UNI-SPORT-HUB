import dbConnect from "@/lib/mongodb";
import ExerciseSchedule from "@/models/ExerciseSchedule";
import PlanRequest from "@/models/PlanRequest";
import Coach from "@/models/Coach";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Find the coach by their universityId from the session
        const coach = await Coach.findOne({ universityId: session.user.universityId });
        if (!coach) {
            return NextResponse.json({ error: "Coach not found" }, { status: 404 });
        }

        // Fetch both session requests and plan requests
        const [sessionRequests, planRequests] = await Promise.all([
            ExerciseSchedule.find({ coachId: coach._id, status: "PENDING" }).sort({ createdAt: -1 }).lean(),
            PlanRequest.find({ coachId: coach._id, status: "PENDING" }).sort({ createdAt: -1 }).lean()
        ]);
        
        // Format both for a unified UI
        const formattedSessions = sessionRequests.map(r => ({
            id: r._id.toString(),
            studentName: r.studentName,
            contactNumber: r.contactNumber,
            type: "SESSION",
            category: r.sessionType, // ONLINE/PHYSICAL
            detail: `Preferred time: ${r.freeTime}`,
            status: r.status,
            createdAt: r.createdAt
        }));

        const formattedPlans = planRequests.map(r => ({
            id: r._id.toString(),
            studentName: r.studentName,
            contactNumber: r.contactNumber,
            type: "PLAN",
            category: r.type, // EXERCISE/MEAL
            detail: r.details,
            status: r.status,
            createdAt: r.createdAt
        }));

        return NextResponse.json([...formattedSessions, ...formattedPlans].sort((a,b) => b.createdAt - a.createdAt));
    } catch (err) {
        console.error("GET exercise requests API error:", err);
        return NextResponse.json({ error: "Failed to fetch exercise requests" }, { status: 500 });
    }
}
