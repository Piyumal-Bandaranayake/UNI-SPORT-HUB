import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    universityId: { type: String, required: true, unique: true }, // Ensure unique universityId across roles should be handled at business logic level too.
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    approvedSports: { type: [String], default: [] },
    sportRequests: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
