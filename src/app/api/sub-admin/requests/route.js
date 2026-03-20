import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import SportRequest from "@/models/SportRequest";
import Student from "@/models/Student";
import Sport from "@/models/Sport";

export async function GET(req) {
    try {
        const session = await auth();
        // Allow BOTH SUB_ADMIN and ADMIN for flexibility, focus on SUB_ADMIN primarily
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Fetch pending requests and populate student and sport details
        const pendingRequests = await SportRequest.find({ status: "PENDING" })
            .populate("studentId", "name universityId universityEmail")
            .populate("sportId", "name image")
            .sort({ createdAt: -1 });

        return NextResponse.json(pendingRequests, { status: 200 });
    } catch (error) {
        console.error("Error fetching sub-admin requests:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
