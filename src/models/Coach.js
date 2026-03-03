import mongoose from 'mongoose';

const CoachSchema = new mongoose.Schema({
    name: { type: String, required: true },
    universityId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    assignedSports: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.Coach || mongoose.model('Coach', CoachSchema);
