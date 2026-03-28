import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import PlanRequest from "@/models/PlanRequest";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { type, coachId, details, contactNumber } = body;

        if (!type || !details || !contactNumber) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const newRequest = await PlanRequest.create({
            studentId: session.user.id,
            studentName: session.user.name,
            type,
            coachId,
            details,
            contactNumber,
            status: "PENDING"
        });

        return NextResponse.json({ success: "Plan request submitted successfully", data: newRequest }, { status: 201 });
    } catch (error) {
        console.error("Error creating plan request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
