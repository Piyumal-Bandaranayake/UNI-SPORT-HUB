import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Equipment from "@/models/Equipment";
import Sport from "@/models/Sport";
import EquipmentBooking from "@/models/EquipmentBooking";
import { NextResponse } from "next/server";

export const POST = auth(async function POST(req) {
    try {
        const session = req.auth;
        
        if (!session || !session.user) {
            console.warn("[BookingAPI] Unauthorized access attempt - no session found.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { equipmentId, quantity } = await req.json();
        const requestedQuantity = parseInt(quantity);
        
        if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
            return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
        }

        await dbConnect();

        // 1. Fetch equipment and verify availability
        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
        }

        if (equipment.available < requestedQuantity) {
            return NextResponse.json({ error: "Not enough equipment available" }, { status: 400 });
        }

        // 2. Fetch sport to get name
        const sport = await Sport.findById(equipment.sportId);
        if (!sport) {
            return NextResponse.json({ error: "Sport not found" }, { status: 404 });
        }

        // 3. Update equipment availability
        equipment.available -= requestedQuantity;
        if (equipment.available === 0) {
            equipment.status = "OUT_OF_STOCK";
        }
        await equipment.save();

        // 4. Create booking record
        const booking = await EquipmentBooking.create({
            userId: session.user.universityId || "UNKNOWN",
            userEmail: session.user.universityEmail || session.user.universityId || "no-email@uni.edu",
            equipmentId: equipment._id,
            equipmentName: equipment.name,
            sportId: sport._id,
            sportName: sport.name,
            quantity: requestedQuantity,
            status: "PENDING",
            bookingDate: new Date(),
            qrCode: "" // Temporary placeholder
        });

        // 5. Build QR data - including verification details
        const qrData = JSON.stringify({
            b: booking._id.toString(), // bookingId
            u: session.user.universityId, // universityId
            e: equipment.name, // equipment
            q: requestedQuantity // quantity
        });

        // Use QR Server API for creating data URL
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
        
        booking.qrCode = qrCodeUrl;
        await booking.save();

        return NextResponse.json({ 
            success: true, 
            bookingId: booking._id,
            qrCode: qrCodeUrl,
            message: "Equipment booked successfully!"
        });

    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "An error occurred while booking" }, { status: 500 });
    }
});
