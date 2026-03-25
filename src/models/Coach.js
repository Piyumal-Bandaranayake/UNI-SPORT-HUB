import mongoose from 'mongoose';

const CoachSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    assignedSports: { type: [String], default: [] },
}, { timestamps: true });

if (mongoose.models.Coach) {
    delete mongoose.models.Coach;
}

export default mongoose.model('Coach', CoachSchema);
