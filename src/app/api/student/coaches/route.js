import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Sport from "@/models/Sport";
import Coach from "@/models/Coach";

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

        if (!student.approvedSports || student.approvedSports.length === 0) {
            return NextResponse.json([]); // Return empty if not joined any team
        }

        // Fetch the corresponding sport names
        const safeIds = student.approvedSports.filter(s => s.length === 24);
        const names = student.approvedSports.filter(s => s.length !== 24);
        
        const populatedSports = await Sport.find({ 
            $or: [
                { _id: { $in: safeIds } },
                { name: { $in: names } }
            ]
        }).lean();

        const sportNames = populatedSports.map(sport => sport.name);

        // Fetch coaches related to these sports
        const coaches = await Coach.find({ 
            assignedSports: { $in: sportNames },
            status: "ACTIVE"
        }).select("name _id").lean();

        return NextResponse.json(coaches);
    } catch (error) {
        console.error("Error fetching coaches:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
