import dbConnect from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const { universityId } = session.user;
        const { id } = params;
        
        const schedule = await Schedule.findOne({ _id: id });
        if (!schedule) {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
        }
        
        if (schedule.coachUniversityId !== universityId) {
             return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await Schedule.deleteOne({ _id: id });

        return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
    } catch (err) {
        console.error("DELETE schedule API error:", err);
        return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
    }
}
