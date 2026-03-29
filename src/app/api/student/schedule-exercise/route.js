import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import ExerciseSchedule from "@/models/ExerciseSchedule";
import Coach from "@/models/Coach";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { coachId, contactNumber, freeTime, sessionType } = body;

        if (!coachId || !contactNumber || !freeTime || !sessionType) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (!["ONLINE", "PHYSICAL"].includes(sessionType)) {
            return NextResponse.json({ error: "Invalid session type" }, { status: 400 });
        }

        await dbConnect();

        const coach = await Coach.findById(coachId);
        if (!coach) return NextResponse.json({ error: "Coach not found" }, { status: 404 });

        const newRequest = await ExerciseSchedule.create({
            studentId: session.user.id,
            coachId,
            studentName: session.user.name,
            contactNumber,
            freeTime,
            sessionType,
            status: "PENDING"
        });

        return NextResponse.json({ success: "Exercise session requested successfully", data: newRequest }, { status: 201 });
    } catch (error) {
        console.error("Error creating schedule:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const requests = await ExerciseSchedule.find({ studentId: session.user.id })
            .populate("coachId", "name")
            .sort({ createdAt: -1 });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching exercise requests:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
