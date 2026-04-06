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
        
        // Find the coach by their email from the session metadata
        const coach = await Coach.findOne({ email: session.user.universityEmail });
        if (!coach) {
            return NextResponse.json({ error: "Coach not found" }, { status: 404 });
        }

        // Fetch both session requests and plan requests
        const statuses = ["PENDING", "ACCEPTED"];
        const [sessionRequests, planRequests] = await Promise.all([
            ExerciseSchedule.find({ coachId: coach._id, status: { $in: statuses } }).sort({ createdAt: -1 }).lean(),
            PlanRequest.find({ coachId: coach._id, status: { $in: statuses } }).sort({ createdAt: -1 }).lean()
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
            meetingLink: r.meetingLink,
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

export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status, type, meetingLink } = await req.json();
        if (!id || !status || !type) {
            return NextResponse.json({ error: "ID, status and type are required" }, { status: 400 });
        }

        await dbConnect();
        
        // Find the coach by their email from the session metadata
        const coach = await Coach.findOne({ email: session.user.universityEmail });
        if (!coach) {
            return NextResponse.json({ error: "Coach not found" }, { status: 404 });
        }
        
        let result;
        if (type === "SESSION") {
            if (status === "ACCEPTED") {
                const targetSession = await ExerciseSchedule.findById(id);
                if (!targetSession) {
                    return NextResponse.json({ error: "Session request not found" }, { status: 404 });
                }

                const existingAcceptedSession = await ExerciseSchedule.findOne({
                    coachId: coach._id,
                    freeTime: targetSession.freeTime,
                    status: "ACCEPTED",
                    _id: { $ne: id }
                });

                if (existingAcceptedSession) {
                    return NextResponse.json({ 
                        error: `You already have an approved session at ${targetSession.freeTime}.` 
                    }, { status: 400 });
                }
            }
            const updatePayload = { status };
            if (meetingLink && status === "ACCEPTED") {
                updatePayload.meetingLink = meetingLink;
            }
            result = await ExerciseSchedule.findByIdAndUpdate(id, updatePayload, { returnDocument: "after" });
        } else if (type === "PLAN") {
            result = await PlanRequest.findByIdAndUpdate(id, { status }, { returnDocument: "after" });
        }

        if (!result) return NextResponse.json({ error: "Request not found" }, { status: 404 });

        return NextResponse.json({ success: true, status: result.status });
    } catch (err) {
        console.error("PATCH exercise requests API error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, type } = await req.json();
        if (!id || !type) {
            return NextResponse.json({ error: "ID and type are required" }, { status: 400 });
        }

        await dbConnect();

        const coach = await Coach.findOne({ email: session.user.universityEmail });
        if (!coach) {
            return NextResponse.json({ error: "Coach not found" }, { status: 404 });
        }

        let result;
        if (type === "SESSION") {
            result = await ExerciseSchedule.findOneAndDelete({ _id: id, coachId: coach._id });
        } else if (type === "PLAN") {
            result = await PlanRequest.findOneAndDelete({ _id: id, coachId: coach._id });
        }

        if (!result) {
            return NextResponse.json({ error: "Request not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("DELETE exercise request API error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
