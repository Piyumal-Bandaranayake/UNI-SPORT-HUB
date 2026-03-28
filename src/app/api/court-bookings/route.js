import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import CourtBooking from "@/models/CourtBooking";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Please login first" }, { status: 401 });
        }

        const body = await req.json();
        const { sportId, sportName, phoneNumber, bookingDate, timeSlot, courtLocation } = body;

        // Backend validation
        if (!sportId || !sportName || !phoneNumber || !bookingDate || !timeSlot || !courtLocation) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
        }

        // Check if the booking date is in the past
        const todayStr = new Date().toISOString().split("T")[0];
        if (bookingDate < todayStr) {
            return NextResponse.json({ error: "Cannot book a past date" }, { status: 400 });
        }

        await dbConnect();

        // Check for duplicate booking at same court, same date, same time
        const existingBooking = await CourtBooking.findOne({
            courtLocation,
            bookingDate,
            timeSlot,
            status: { $in: ["PENDING", "CONFIRMED"] }
        });

        if (existingBooking) {
            return NextResponse.json(
                { error: `This court is already booked on ${bookingDate} at ${timeSlot}. Please select a different time or court.` },
                { status: 409 }
            );
        }

        // Create the booking
        const newBooking = await CourtBooking.create({
            userId: session.user.universityId,
            userEmail: session.user.universityEmail || session.user.email,
            phoneNumber,
            sportId,
            sportName,
            courtLocation,
            bookingDate,
            timeSlot,
            status: "CONFIRMED"
        });

        return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
    } catch (error) {
        console.error("Court checking error:", error);
        return NextResponse.json({ error: "Failed to process court booking" }, { status: 500 });
    }
}
