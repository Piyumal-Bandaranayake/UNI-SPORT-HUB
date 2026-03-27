import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import EquipmentBooking from "@/models/EquipmentBooking";
import { NextResponse } from "next/server";

export const GET = auth(async function GET(req) {
    try {
        const session = req.auth;
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Fetch bookings for the logged-in student using their universityId
        const bookings = await EquipmentBooking.find({ 
            userId: session.user.universityId 
        }).sort({ createdAt: -1 }).lean();

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
});
