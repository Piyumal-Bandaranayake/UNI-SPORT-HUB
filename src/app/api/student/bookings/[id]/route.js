import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Equipment from "@/models/Equipment";
import EquipmentBooking from "@/models/EquipmentBooking";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        // 1. Find the booking
        const booking = await EquipmentBooking.findById(id);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // 2. Ensure it belongs to the current user
        if (booking.userId !== session.user.universityId) {
            return NextResponse.json({ error: "Unauthorized to delete this booking" }, { status: 403 });
        }

        // 3. Check if status allows cancellation
        if (booking.status !== "PENDING" && booking.status !== "ACTIVE") {
            return NextResponse.json({ error: "Only PENDING or ACTIVE bookings can be canceled" }, { status: 400 });
        }

        // 4. Update the equipment inventory
        const equipment = await Equipment.findById(booking.equipmentId);
        if (equipment) {
            equipment.available += booking.quantity;
            if (equipment.status === "OUT_OF_STOCK") {
                equipment.status = "AVAILABLE";
            }
            await equipment.save();
        }

        // 5. Delete the booking
        await EquipmentBooking.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: "Booking canceled and deleted successfully" });
    } catch (error) {
        console.error("Delete booking error:", error);
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }
}
