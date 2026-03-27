import dbConnect from "@/lib/mongodb";
import Equipment from "@/models/Equipment";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// GET: Fetch inventory for a specific sport

export async function GET(req) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const sportId = searchParams.get("sportId");

        if (!sportId) return NextResponse.json({ error: "sportId is required" }, { status: 400 });

        await dbConnect();
        const inventory = await Equipment.find({ sportId }).sort({ createdAt: -1 });

        return NextResponse.json(inventory);
    } catch (err) {
        console.error("fetchInventory API error:", err);
        return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
    }
}

// POST: Add new equipment
export async function POST(req) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { name, sportId, category, quantity, condition } = data;

        if (!name || !sportId || !category || quantity === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();
        const newItem = await Equipment.create({
            ...data,
            available: quantity,
            lastUpdatedBy: session.user.universityId || session.user.email || "SYSTEM"
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (err) {
        console.error("createEquipment API error:", err);
        return NextResponse.json({ error: "Failed to add equipment" }, { status: 500 });
    }
}

// PATCH: Update equipment
export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { id, ...updates } = data;

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await dbConnect();
        const updatedItem = await Equipment.findByIdAndUpdate(
            id,
            { ...updates, lastUpdatedBy: session.user.universityId },
            { new: true }
        );

        if (!updatedItem) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        return NextResponse.json(updatedItem);
    } catch (err) {
        console.error("updateEquipment API error:", err);
        return NextResponse.json({ error: "Failed to update equipment" }, { status: 500 });
    }
}

// DELETE: Remove equipment
export async function DELETE(req) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "SUB_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await dbConnect();
        const deleted = await Equipment.findByIdAndDelete(id);

        if (!deleted) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        return NextResponse.json({ success: "Item removed successfully" });
    } catch (err) {
        console.error("deleteEquipment API error:", err);
        return NextResponse.json({ error: "Failed to delete equipment" }, { status: 500 });
    }
}
