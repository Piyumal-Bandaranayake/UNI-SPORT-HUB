import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Sport from "@/models/Sport";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const student = await Student.findById(session.user.id);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Fetch the populated approved sports
        let populatedSports = [];
        if (student.approvedSports && student.approvedSports.length > 0) {
            const safeIds = student.approvedSports.filter(s => s.length === 24);
            const names = student.approvedSports.filter(s => s.length !== 24);
            
            populatedSports = await Sport.find({ 
                $or: [
                    { _id: { $in: safeIds } },
                    { name: { $in: names } }
                ]
            }).lean();
        }

        return NextResponse.json({
            ...student.toObject(),
            populatedApprovedSports: populatedSports
        });
    } catch (error) {
        console.error("Error fetching student profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
