import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import CourtBooking from "@/models/CourtBooking";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import mongoose from "mongoose";

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

        // Pre-generate the ObjectId so we can include it in the QR
        const bookingId = new mongoose.Types.ObjectId();

        // Generate QR code with booking details
        const qrData = JSON.stringify({
            bookingId: bookingId.toString(),
            sport: sportName,
            court: courtLocation,
            date: bookingDate,
            time: timeSlot,
            name: session.user.name,
            email: session.user.universityEmail || session.user.email
        });

        const qrCode = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: { dark: "#1e1b4b", light: "#ffffff" }
        });

        // Create the booking in a single database operation
        const newBooking = await CourtBooking.create({
            _id: bookingId,
            userId: session.user.universityId,
            userEmail: session.user.universityEmail || session.user.email,
            phoneNumber,
            sportId,
            sportName,
            courtLocation,
            bookingDate,
            timeSlot,
            status: "CONFIRMED",
            qrCode: qrCode
        });

        return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
    } catch (error) {
        console.error("Court checking error:", error);
        return NextResponse.json({ error: "Failed to process court booking" }, { status: 500 });
    }
}
