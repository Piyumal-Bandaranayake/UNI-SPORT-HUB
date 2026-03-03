// Run this ONCE from your project root:
// node scripts/seed-admin.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    universityId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    permissions: { type: [String], default: [] },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // ---- CHANGE THESE BEFORE RUNNING ----
        const adminData = {
            name: "Super Admin",
            universityId: "ADMIN-001",
            password: "Admin@1234",
        };
        // ------------------------------------

        const existing = await Admin.findOne({ universityId: adminData.universityId });
        if (existing) {
            console.log("⚠️  Admin with this universityId already exists. Skipping.");
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(adminData.password, 10);

        await Admin.create({
            name: adminData.name,
            universityId: adminData.universityId,
            passwordHash,
        });

        console.log("🎉 Admin created successfully!");
        console.log(`   Name: ${adminData.name}`);
        console.log(`   University ID: ${adminData.universityId}`);
        console.log(`   Password: ${adminData.password}`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

seedAdmin();
