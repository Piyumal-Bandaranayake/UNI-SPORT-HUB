import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import SportRequest from "@/models/SportRequest";
import Student from "@/models/Student";
import Sport from "@/models/Sport";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const body = await req.json();
        const { sportId, details, certificates } = body;

        if (!sportId || !details) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify if sport exists
        const sport = await Sport.findById(sportId);
        if (!sport) {
            return NextResponse.json({ error: "Sport not found" }, { status: 404 });
        }

        // Check if a request already exists
        const existingReq = await SportRequest.findOne({ studentId: session.user.id, sportId, status: "PENDING" });
        if (existingReq) {
            return NextResponse.json({ error: "You already have a pending request for this sport" }, { status: 400 });
        }
        
        // Also check if they are already approved
        const student = await Student.findById(session.user.id);
        if (student?.approvedSports?.includes(sportId)) {
            return NextResponse.json({ error: "You are already joined to this sport" }, { status: 400 });
        }

        const newRequest = await SportRequest.create({
            studentId: session.user.id,
            sportId,
            details,
            certificates: certificates || [],
            status: "PENDING"
        });

        // Add to student's sportRequests list if needed (based on original schema)
        if (student && !student.sportRequests?.includes(sportId)) {
            student.sportRequests = student.sportRequests || [];
            student.sportRequests.push(sportId);
            await student.save();
        }

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        console.error("Error creating sport request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
