import dbConnect from "@/lib/mongodb";
import Achievement from "@/models/Achievement";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const { universityId } = session.user;
        const achievements = await Achievement.find({ coachUniversityId: universityId }).sort({ createdAt: -1 }).lean();
        
        const formatted = achievements.map(a => ({
            id: a._id.toString(),
            title: a.title,
            description: a.description,
            date: a.date,
            image: a.image,
            sportName: a.sportName,
            createdAt: a.createdAt
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("GET achievements API error:", err);
        return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== "COACH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const { universityId } = session.user;
        const body = await req.json();
        
        const { title, description, date, image, sportName } = body;
        
        if (!title || !description || !date || !image || !sportName) {
             return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newAchievement = await Achievement.create({
            title,
            description,
            date,
            image,
            sportName,
            coachUniversityId: universityId
        });

        return NextResponse.json({ message: "Achievement published!", achievementId: newAchievement._id }, { status: 201 });
    } catch (err) {
        console.error("POST achievements API error:", err);
        return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 });
    }
}
