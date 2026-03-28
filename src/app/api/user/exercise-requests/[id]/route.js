import dbConnect from "@/lib/mongodb";
import ExerciseSchedule from "@/models/ExerciseSchedule";
import PlanRequest from "@/models/PlanRequest";
import Coach from "@/models/Coach";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const { status } = body;

        if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await dbConnect();
        
        // Find the coach by their universityId to verify ownership
        const coach = await Coach.findOne({ universityId: session.user.universityId });
        if (!coach) {
            return NextResponse.json({ error: "Coach not found" }, { status: 404 });
        }

        let request = await ExerciseSchedule.findById(id);
        if (!request) {
            request = await PlanRequest.findById(id);
        }

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }
        
        // Verify this coach is the one assigned to the request
        if (request.coachId.toString() !== coach._id.toString()) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        request.status = status;
        await request.save();

        return NextResponse.json({ message: "Status updated successfully", status: request.status }, { status: 200 });
    } catch (err) {
        console.error("PATCH exercise request API error:", err);
        return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
    }
}
