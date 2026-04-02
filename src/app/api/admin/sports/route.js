import dbConnect from "@/lib/mongodb";
import Sport from "@/models/Sport";
import SubAdmin from "@/models/SubAdmin";
import Coach from "@/models/Coach";
import Student from "@/models/Student";
import Event from "@/models/Event";
import Schedule from "@/models/Schedule";
import SportRequest from "@/models/SportRequest";
import Achievement from "@/models/Achievement";
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

            // Sync name across other models if changed
            const sportToUpdate = await Sport.findById(id);
            if (sportToUpdate && sportToUpdate.name !== trimmedName) {
                const oldName = sportToUpdate.name;
                await Promise.all([
                    SubAdmin.updateMany({ managedSports: oldName }, { $set: { "managedSports.$": trimmedName } }),
                    Coach.updateMany({ assignedSports: oldName }, { $set: { "assignedSports.$": trimmedName } }),
                    Student.updateMany({ approvedSports: oldName }, { $set: { "approvedSports.$": trimmedName } }),
                    Student.updateMany({ sportRequests: oldName }, { $set: { "sportRequests.$": trimmedName } }),
                    Schedule.updateMany({ sportName: oldName }, { sportName: trimmedName }),
                    Achievement.updateMany({ sportName: oldName }, { sportName: trimmedName })
                ]);
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

        // 1. Find the sport to get name and ID context
        const sportToDelete = await Sport.findById(id);
        if (!sportToDelete) {
            return NextResponse.json({ error: "Sport not found" }, { status: 404 });
        }

        const sportId = sportToDelete._id;
        const sportName = sportToDelete.name;

        // 2. Clear String-based assignments (SubAdmins, Coaches, Students, Schedules)
        await Promise.all([
            // Remove from Sub-Admins
            SubAdmin.updateMany(
                { managedSports: sportName },
                { $pull: { managedSports: sportName } }
            ),
            // Remove from Coaches
            Coach.updateMany(
                { assignedSports: sportName },
                { $pull: { assignedSports: sportName } }
            ),
            // Remove from Students
            Student.updateMany(
                { $or: [{ approvedSports: sportName }, { sportRequests: sportName }] },
                { $pull: { approvedSports: sportName, sportRequests: sportName } }
            ),
            // Delete Schedules and Achievements linked by Name
            Schedule.deleteMany({ sportName: sportName }),
            Achievement.deleteMany({ sportName: sportName })
        ]);

        // 3. Clear ObjectId-based associations (Events, SportRequests)
        await Promise.all([
            Event.deleteMany({ sportId: sportId }),
            SportRequest.deleteMany({ sportId: sportId })
        ]);

        // 4. Finally delete the Sport itself
        await Sport.findByIdAndDelete(id);

        return NextResponse.json({ 
            success: `Sport "${sportName}" removed successfully. All assignments for Sub-Admins, Coaches, and Students have been cleared, and associated schedules/events have been deleted.` 
        });
    } catch (err) {
        console.error("deleteSport API error:", err);
        return NextResponse.json({ error: "Failed to delete sport and clear assignments" }, { status: 500 });
    }
}
