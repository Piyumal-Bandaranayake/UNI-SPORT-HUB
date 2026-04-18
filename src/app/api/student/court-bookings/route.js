import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import CourtBooking from "@/models/CourtBooking";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const userEmail = session.user.universityEmail || session.user.email;
        const universityId = session.user.universityId;

        const query = universityId
            ? { 
                $or: [{ userEmail }, { userId: universityId }],
                status: { $ne: "CANCELLED" }
              }
            : { userEmail, status: { $ne: "CANCELLED" } };

        const courtBookings = await CourtBooking.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(courtBookings);
    } catch (error) {
        console.error("Fetch court bookings error:", error);
        return NextResponse.json({ error: "Failed to fetch court bookings" }, { status: 500 });
    }
}
