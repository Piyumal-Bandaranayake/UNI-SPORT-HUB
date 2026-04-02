import dbConnect from "@/lib/mongodb";
import SportRequest from "@/models/SportRequest";
import Equipment from "@/models/Equipment";
import Sport from "@/models/Sport";
import SubAdmin from "@/models/SubAdmin";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "SUB_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { universityId } = session.user;
        await dbConnect();

        // 1. Get Sub Admin's managed sports names
        const subAdmin = await SubAdmin.findOne({ email: universityId }, "managedSports").lean();
        if (!subAdmin) {
            return NextResponse.json({ error: "Sub-Admin record not found" }, { status: 404 });
        }

        const managedSportNames = subAdmin.managedSports || [];
        if (managedSportNames.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Map names to Sport IDs
        const managedSports = await Sport.find({ name: { $in: managedSportNames } }, "_id name").lean();
        const sportIds = managedSports.map(s => s._id);

        // 3. Fetch pending sport requests for these sports
        const pendingSportRequests = await SportRequest.find({ 
            sportId: { $in: sportIds },
            status: "PENDING"
        })
        .populate("studentId", "name universityId")
        .populate("sportId", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

        // 4. Fetch low inventory items for these sports (threshold < 10)
        const lowInventory = await Equipment.find({
            sportId: { $in: sportIds },
            quantity: { $lt: 10 }
        })
        .populate("sportId", "name")
        .sort({ quantity: 1 })
        .limit(10)
        .lean();

        const notifications = [
            ...pendingSportRequests.map(r => ({
                id: r._id.toString(),
                type: "SPORT_REQUEST",
                title: "New Sport Enrollment Request",
                message: `${r.studentId?.name || "A student"} wants to join ${r.sportId?.name || "a sport"}.`,
                time: r.createdAt,
                data: {
                    studentId: r.studentId?._id,
                    sportId: r.sportId?._id
                }
            })),
            ...lowInventory.map(e => ({
                id: e._id.toString(),
                type: "INVENTORY_ALERT",
                title: "Low Inventory Alert",
                message: `${e.name} in ${e.sportId?.name} is low on stock (${e.quantity} left).`,
                time: e.updatedAt,
                data: {
                    itemId: e._id,
                    sportId: e.sportId?._id
                }
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time));

        return NextResponse.json(notifications);
    } catch (err) {
        console.error("fetch SubAdmin notifications API error:", err);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
