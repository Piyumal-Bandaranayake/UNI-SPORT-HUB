import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import CourtBooking from "@/models/CourtBooking";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const booking = await CourtBooking.findById(id);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Verify ownership
        const userEmail = session.user.universityEmail || session.user.email;
        const isOwner =
            booking.userEmail === userEmail ||
            booking.userId === session.user.universityId;

        if (!isOwner) {
            return NextResponse.json({ error: "Unauthorized to cancel this booking" }, { status: 403 });
        }

        if (booking.status === "CANCELLED") {
            return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
        }

        booking.status = "CANCELLED";
        await booking.save();

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        console.error("Cancel court booking error:", error);
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }
}
