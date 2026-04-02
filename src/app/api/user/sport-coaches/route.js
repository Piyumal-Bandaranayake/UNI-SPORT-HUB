import dbConnect from "@/lib/mongodb";
import Coach from "@/models/Coach";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sportName = searchParams.get("sportName");

        if (!sportName) return NextResponse.json({ error: "sportName is required" }, { status: 400 });

        await dbConnect();
        
        // Find coaches who have this sport assigned
        const coaches = await Coach.find({
            assignedSports: sportName,
            status: "ACTIVE"
        }, "name email").lean();

        const formatted = coaches.map(c => ({
            id: c._id.toString(),
            name: c.name,
            email: c.email
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("fetchSportCoaches API error:", err);
        return NextResponse.json({ error: "Failed to fetch coaches" }, { status: 500 });
    }
}
