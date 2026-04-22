import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import Student from "@/models/Student";
import Coach from "@/models/Coach";
import SportRequest from "@/models/SportRequest";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const sport = await Sport.findById(id).lean();
        if (!sport) {
            return NextResponse.json({ error: "Sport not found" }, { status: 404 });
        }

        // Fetch all members (approved students)
        const approvedMembers = await Student.find(
            { approvedSports: id },
            "name universityId universityEmail faculty status"
        ).lean();

        // Fetch pending requests with SportRequest details
        const pendingRequests = await SportRequest.find({
            sportId: id,
            status: "PENDING"
        }).populate("studentId", "name universityId universityEmail faculty").lean();

        // Fetch assigned coaches by sport name or sport ID for compatibility
        const assignedCoaches = await Coach.find({
            status: "ACTIVE",
            $or: [
                { assignedSports: id },
                { assignedSports: sport.name }
            ]
        }, "name email").lean();

        return NextResponse.json({
            sport,
            approvedMembers,
            pendingRequests,
            assignedCoaches
        });
    } catch (err) {
        console.error("Sport details API error:", err);
        return NextResponse.json({ error: "Failed to fetch sport details" }, { status: 500 });
    }
}
