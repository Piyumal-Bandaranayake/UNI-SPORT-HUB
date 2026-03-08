import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// GET: Fetch events for a specific sport
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const sportId = searchParams.get("sportId");

        if (!sportId) return NextResponse.json({ error: "sportId is required" }, { status: 400 });

        await dbConnect();
        const events = await Event.find({ sportId }).sort({ date: 1, time: 1 }).populate("participants", "name universityId").lean();

        return NextResponse.json(events);
    } catch (err) {
        console.error("fetchSportEvents API error:", err);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

// POST: Create a new event
export async function POST(req) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { name, sportId, date, time, location, type } = data;

        if (!name || !sportId || !date || !time || !location || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();
        const newEvent = await Event.create({
            ...data,
            createdBy: session.user.universityId
        });

        return NextResponse.json(newEvent, { status: 201 });
    } catch (err) {
        console.error("createEvent API error:", err);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}

// PATCH: Update event participants or details
export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, participants, status, ...updates } = await req.json();
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await dbConnect();
        
        let updateData = { ...updates };
        if (participants) updateData.participants = participants;
        if (status) updateData.status = status;

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate("participants", "name universityId");

        if (!updatedEvent) return NextResponse.json({ error: "Event not found" }, { status: 404 });

        return NextResponse.json(updatedEvent);
    } catch (err) {
        console.error("updateEvent API error:", err);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// DELETE: Remove an event
export async function DELETE(req) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await dbConnect();
        const deleted = await Event.findByIdAndDelete(id);

        if (!deleted) return NextResponse.json({ error: "Event not found" }, { status: 404 });

        return NextResponse.json({ success: "Event removed successfully" });
    } catch (err) {
        console.error("deleteEvent API error:", err);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
