import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();
        // Fetch all sports to ensure older records without 'status' are also returned
        const sports = await Sport.find({}).lean();
        const formatted = sports.map((s) => ({
            _id: s._id.toString(),
            id: s._id.toString(),
            name: s.name,
            description: s.description,
            image: s.image,
            status: s.status,
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("public getSports API error:", err);
        return NextResponse.json({ error: "Failed to fetch sports" }, { status: 500 });
    }
}
