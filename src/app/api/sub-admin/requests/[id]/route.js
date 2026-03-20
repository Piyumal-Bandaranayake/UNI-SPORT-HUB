import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import SportRequest from "@/models/SportRequest";
import Student from "@/models/Student";

export async function PUT(req, { params }) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams; // SportRequest ID
        const body = await req.json();
        const { status } = body; // Expecting "ACCEPTED" or "REJECTED"

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await dbConnect();

        const sportRequest = await SportRequest.findById(id);
        if (!sportRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        sportRequest.status = status;
        await sportRequest.save();

        if (status === "ACCEPTED") {
            const student = await Student.findById(sportRequest.studentId);
            if (student) {
                const isAlreadyApproved = student.approvedSports?.includes(sportRequest.sportId.toString());
                const newApprovedSports = isAlreadyApproved 
                    ? student.approvedSports 
                    : [...(student.approvedSports || []), sportRequest.sportId.toString()];
                
                const newSportRequests = (student.sportRequests || []).filter(
                    request => request.toString() !== sportRequest.sportId.toString()
                );

                await Student.findByIdAndUpdate(sportRequest.studentId, {
                    $set: {
                        approvedSports: newApprovedSports,
                        sportRequests: newSportRequests
                    }
                });
            }
        } else if (status === "REJECTED") {
            const student = await Student.findById(sportRequest.studentId);
            if (student) {
                const newSportRequests = (student.sportRequests || []).filter(
                    request => request.toString() !== sportRequest.sportId.toString()
                );
                await Student.findByIdAndUpdate(sportRequest.studentId, {
                    $set: { sportRequests: newSportRequests }
                });
            }
        }

        return NextResponse.json({ message: `Request ${status} successfully`, request: sportRequest }, { status: 200 });

    } catch (error) {
        console.error("Error updating request status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
