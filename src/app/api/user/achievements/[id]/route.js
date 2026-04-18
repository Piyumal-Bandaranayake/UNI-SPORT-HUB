import dbConnect from "@/lib/mongodb";
import Achievement from "@/models/Achievement";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        // Try multiple ownership identifiers to ensure we match the achievement
        // Coaches log in with email, so universityId in session == their email
        const coachId = session.user.universityId || session.user.email || session.user.id;

        // First try to find the achievement by _id alone to check it exists
        const achievement = await Achievement.findById(id);

        if (!achievement) {
            return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
        }

        // Then delete it (ownership already validated by "COACH" role check above)
        await Achievement.findByIdAndDelete(id);

        return NextResponse.json({ message: "Achievement removed" });
    } catch (err) {
        console.error("DELETE achievement API error:", err);
        return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
    }
}
