import dbConnect from "@/lib/mongodb";
import ExerciseSchedule from "@/models/ExerciseSchedule";
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

        // Only fetch pending requests
        const requests = await ExerciseSchedule.find({ 
            coachId: coach._id,
            status: "PENDING"
        }).sort({ createdAt: -1 }).lean();
        
        // Format the ID for the frontend
        const formatted = requests.map(r => ({
            id: r._id.toString(),
            studentName: r.studentName,
            contactNumber: r.contactNumber,
            freeTime: r.freeTime,
            sessionType: r.sessionType,
            status: r.status,
            createdAt: r.createdAt
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("GET exercise requests API error:", err);
        return NextResponse.json({ error: "Failed to fetch exercise requests" }, { status: 500 });
    }
}
