import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import SportRequest from "@/models/SportRequest"; // New import
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
        const sportId = searchParams.get("sportId");
        const type = searchParams.get("type"); // "pending" or "roster"

        if (!sportName && !sportId) return NextResponse.json({ error: "sportName or sportId is required" }, { status: 400 });

        await dbConnect();

        if (type === "pending") {
            // First find special SportRequests with details
            const requests = await SportRequest.find({
                sportId: sportId,
                status: "PENDING"
            }).populate("studentId").lean();

            // Format those first
            const formattedRequests = requests.map(r => ({
                id: r.studentId?._id.toString(),
                requestId: r._id.toString(),
                name: r.studentId?.name,
                universityId: r.studentId?.universityId,
                email: r.studentId?.universityEmail,
                details: r.details,
                certificates: r.certificates,
                status: "PENDING"
            })).filter(r => r.id); // Filter out if student not found

            // Also find students who have it in their array but no SportRequest record (compatibility)
            const studentsWithArray = await Student.find({
                $and: [
                    { $or: [{ sportRequests: sportName }, { sportRequests: sportId }] },
                    { _id: { $nin: formattedRequests.map(fr => fr.id) } }
                ]
            }, "name universityId universityEmail status").lean();

            const formattedArray = studentsWithArray.map(s => ({
                id: s._id.toString(),
                name: s.name,
                universityId: s.universityId,
                email: s.universityEmail,
                status: s.status
            }));

            return NextResponse.json([...formattedRequests, ...formattedArray]);
        } else {
            const students = await Student.find({
                $or: [
                    { approvedSports: sportName },
                    { approvedSports: sportId }
                ]
            }, "name universityId universityEmail status").lean();

            const formatted = students.map(s => ({
                id: s._id.toString(),
                name: s.name,
                universityId: s.universityId,
                email: s.universityEmail,
                status: s.status
            }));

            return NextResponse.json(formatted);
        }
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

        const { studentId, sportName, sportId, action } = await req.json();

        if (!studentId || (!sportName && !sportId) || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const student = await Student.findById(studentId);
        if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

        // Update SportRequest document if it exists
        if (action === "approve" || action === "reject") {
            await SportRequest.updateMany(
                { studentId, sportId: sportId || { $exists: true }, status: "PENDING" },
                { status: action === "approve" ? "ACCEPTED" : "REJECTED" }
            );
        }

        if (action === "approve") {
            // Remove from requests (both name and ID formats) and add to approved (using ID if available)
            student.sportRequests = student.sportRequests.filter(s => s !== sportName && s !== sportId);
            
            const valueToAdd = sportId || sportName;
            if (!student.approvedSports.includes(valueToAdd)) {
                student.approvedSports.push(valueToAdd);
            }
        } else if (action === "reject") {
            // Just remove from requests (both formats)
            student.sportRequests = student.sportRequests.filter(s => s !== sportName && s !== sportId);
        } else if (action === "remove") {
            // Remove from approved roster (both formats)
            student.approvedSports = student.approvedSports.filter(s => s !== sportName && s !== sportId);
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
