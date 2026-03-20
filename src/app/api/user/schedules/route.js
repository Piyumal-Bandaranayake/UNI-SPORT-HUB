import dbConnect from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const { universityId } = session.user;
        const schedules = await Schedule.find({ coachUniversityId: universityId }).sort({ createdAt: -1 }).lean();
        
        const formatted = schedules.map(s => ({
            id: s._id.toString(),
            sportName: s.sportName,
            date: s.date,
            time: s.time,
            location: s.location,
            activity: s.activity,
            createdAt: s.createdAt
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("GET schedules API error:", err);
        return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const { universityId } = session.user;
        const body = await req.json();
        
        const { sportName, date, time, location, activity } = body;
        
        if (!sportName || !date || !time || !location || !activity) {
             return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newSchedule = await Schedule.create({
            sportName,
            coachUniversityId: universityId,
            date,
            time,
            location,
            activity
        });

        return NextResponse.json({ message: "Schedule created perfectly", scheduleId: newSchedule._id }, { status: 201 });
    } catch (err) {
        console.error("POST schedules API error:", err);
        return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
    }
}
