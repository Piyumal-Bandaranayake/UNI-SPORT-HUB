import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized: Only admins can create sports." }, { status: 401 });
        }

        const { name, description, image } = await req.json();
        const trimmedName = name?.trim();

        if (!trimmedName) {
            return NextResponse.json({ error: "Sport name is required." }, { status: 400 });
        }

        await dbConnect();

        // Case-insensitive duplicate check
        const existing = await Sport.findOne({ 
            name: { $regex: new RegExp("^" + trimmedName + "$", "i") } 
        });

        if (existing) {
            return NextResponse.json({ error: `Sport department "${trimmedName}" already exists.` }, { status: 400 });
        }

        const newSport = await Sport.create({ name: trimmedName, description, image });

        return NextResponse.json({ success: `Sport "${name}" created successfully.`, data: newSport }, { status: 201 });
    } catch (err) {
        console.error("createSport API error:", err);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const [sports, subAdmins, coaches] = await Promise.all([
            Sport.find({}).lean(),
            SubAdmin.find({}, "name managedSports").lean(),
            Coach.find({}, "name assignedSports").lean()
        ]);

        const formatted = sports.map((s) => ({
            id: s._id.toString(),
            name: s.name,
            description: s.description,
            image: s.image,
            status: s.status,
            assignedSubAdmins: subAdmins.filter(sa => sa.managedSports?.includes(s.name)).map(sa => sa.name),
            assignedCoaches: coaches.filter(c => c.assignedSports?.includes(s.name)).map(c => c.name),
            createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("getSports API error:", err);
        return NextResponse.json({ error: "Failed to fetch sports" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || !["ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, name, description, status, ...updates } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "Sport ID is required" }, { status: 400 });
        }

        await dbConnect();

        const updateData = {};
        if (status) updateData.status = status;
        if (description !== undefined) updateData.description = description;
        if (updates.image) updateData.image = updates.image;
        
        if (name) {
            const trimmedName = name.trim();
            if (trimmedName.length < 3) {
                return NextResponse.json({ error: "Sport title must be at least 3 characters." }, { status: 400 });
            }

            // Check for potential naming duplicate (excluding current sport)
            const existing = await Sport.findOne({ 
                name: { $regex: new RegExp("^" + trimmedName + "$", "i") },
                _id: { $ne: id }
            });
            if (existing) {
                return NextResponse.json({ error: `The name "${trimmedName}" is already taken by another department.` }, { status: 400 });
            }
            updateData.name = trimmedName;
        }

        const updated = await Sport.findByIdAndUpdate(id, updateData, { returnDocument: "after" });

        if (!updated) {
            return NextResponse.json({ error: "Sport not found" }, { status: 404 });
        }

        return NextResponse.json({ success: "Sport metadata updated successfully", data: updated });
    } catch (err) {
        console.error("updateSport API error:", err);
        return NextResponse.json({ error: "Failed to update sport" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await dbConnect();
        const deleted = await Sport.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: "Sport not found" }, { status: 404 });
        }

        return NextResponse.json({ success: "Sport removed successfully" });
    } catch (err) {
        console.error("deleteSport API error:", err);
        return NextResponse.json({ error: "Failed to delete sport" }, { status: 500 });
    }
}
