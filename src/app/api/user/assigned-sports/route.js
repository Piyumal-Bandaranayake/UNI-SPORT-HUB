import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { universityId, role } = session.user;
        await dbConnect();

        let sportNames = [];

        if (role === "COACH") {
            const coach = await Coach.findOne({ email: session.user.universityEmail }, "assignedSports").lean();
            if (coach) {
                sportNames = coach.assignedSports || [];
            }
        } else if (role === "SUB_ADMIN") {
            const subAdmin = await SubAdmin.findOne({ email: universityId }, "managedSports").lean();
            if (subAdmin) {
                sportNames = subAdmin.managedSports || [];
            }
        } else if (role === "ADMIN") {
            // Admins can see all sports
            const allSports = await Sport.find({}).lean();
            return NextResponse.json(allSports.map(s => ({
                id: s._id.toString(),
                name: s.name,
                description: s.description,
                image: s.image,
                status: s.status
            })));
        } else {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Fetch the full sport details for the assigned/managed sport names
        const sports = await Sport.find({ name: { $in: sportNames } }).lean();

        const formatted = sports.map((s) => ({
            id: s._id.toString(),
            name: s.name,
            description: s.description,
            image: s.image,
            status: s.status,
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("assigned-sports API error:", err);
        return NextResponse.json({ error: "Failed to fetch assigned sports" }, { status: 500 });
    }
}
