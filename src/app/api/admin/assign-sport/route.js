import dbConnect from "@/lib/mongodb";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized: Only admins can assign sports." }, { status: 401 });
        }

        const { type, universityId, sports } = await req.json();

        if (!type || !universityId || !Array.isArray(sports)) {
            return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
        }

        await dbConnect();

        let user;
        if (type === "SUB_ADMIN") {
            user = await SubAdmin.findOneAndUpdate(
                { universityId },
                { managedSports: sports },
                { new: true }
            );
        } else if (type === "COACH") {
            user = await Coach.findOneAndUpdate(
                { universityId },
                { assignedSports: sports },
                { new: true }
            );
        } else {
            return NextResponse.json({ error: "Invalid user type." }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        return NextResponse.json({ success: "Sports assigned successfully.", data: user });
    } catch (err) {
        console.error("assignSport API error:", err);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
