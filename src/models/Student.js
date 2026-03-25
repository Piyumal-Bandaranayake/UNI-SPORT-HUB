import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    universityId: { type: String, required: true, unique: true },
    universityEmail: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    faculty: { type: String, required: true, enum: ["IT", "BM", "ENG", "HM", "AR", "HU", "FA"] },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    approvedSports: { type: [String], default: [] },
    sportRequests: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
