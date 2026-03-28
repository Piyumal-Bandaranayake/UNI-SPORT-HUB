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
        const { type, goal, currentWeight, currentHeight, activityLevel, restrictions, preferredDays } = body;

        if (!type || !goal) {
            return NextResponse.json({ error: "Goal and Plan Type are required" }, { status: 400 });
        }

        await dbConnect();

        const newRequest = await PlanRequest.create({
            studentId: session.user.id,
            studentName: session.user.name,
            type,
            goal,
            currentWeight,
            currentHeight,
            activityLevel,
            restrictions,
            preferredDays: preferredDays || [],
            status: "PENDING"
        });

        return NextResponse.json({ message: "Plan request submitted successfully", data: newRequest }, { status: 201 });
    } catch (error) {
        console.error("Error creating plan request:", error);
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

        const requests = await PlanRequest.find({ studentId: session.user.id }).sort({ createdAt: -1 });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching plan requests:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
