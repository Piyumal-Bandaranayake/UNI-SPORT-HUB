import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// GET: Fetch pending requests or approved roster for a sport
export async function GET(req) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sportName = searchParams.get("sportName");
        const type = searchParams.get("type"); // "pending" or "roster"

        if (!sportName) return NextResponse.json({ error: "sportName is required" }, { status: 400 });

        await dbConnect();

        let students = [];
        if (type === "pending") {
            students = await Student.find({ sportRequests: sportName }, "name universityId universityEmail status").lean();
        } else {
            students = await Student.find({ approvedSports: sportName }, "name universityId universityEmail status").lean();
        }

        const formatted = students.map(s => ({
            id: s._id.toString(),
            name: s.name,
            universityId: s.universityId,
            email: s.universityEmail,
            status: s.status
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("fetchSportMembers API error:", err);
        return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }
}

// PATCH: Approve or Reject a sport request
export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { studentId, sportName, action } = await req.json();

        if (!studentId || !sportName || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const student = await Student.findById(studentId);
        if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

        if (action === "approve") {
            // Remove from requests and add to approved
            student.sportRequests = student.sportRequests.filter(s => s !== sportName);
            if (!student.approvedSports.includes(sportName)) {
                student.approvedSports.push(sportName);
            }
        } else if (action === "reject") {
            // Just remove from requests
            student.sportRequests = student.sportRequests.filter(s => s !== sportName);
        } else if (action === "remove") {
            // Remove from approved roster
            student.approvedSports = student.approvedSports.filter(s => s !== sportName);
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        await student.save();

        return NextResponse.json({ success: `Action "${action}" completed successfully` });
    } catch (err) {
        console.error("updateMemberStatus API error:", err);
        return NextResponse.json({ error: "Failed to update member status" }, { status: 500 });
    }
}
