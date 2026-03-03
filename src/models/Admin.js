import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    universityId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    permissions: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
