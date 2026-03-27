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

        const { id } = params;

        await dbConnect();
        
        const { universityId } = session.user;
        const deleted = await Achievement.findOneAndDelete({ _id: id, coachUniversityId: universityId });
        
        if (!deleted) {
            return NextResponse.json({ error: "Achievement not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Achievement removed" });
    } catch (err) {
        console.error("DELETE achievement API error:", err);
        return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
    }
}
