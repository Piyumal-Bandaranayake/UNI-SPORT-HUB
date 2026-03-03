import mongoose from 'mongoose';

const SubAdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    universityId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    managedSports: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.SubAdmin || mongoose.model('SubAdmin', SubAdminSchema);
