import mongoose from 'mongoose';

const SportRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    sportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    details: { type: String, required: true },
    certificates: { type: [String], default: [] }, // Array of base64 strings or URLs
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
}, { timestamps: true });

export default mongoose.models.SportRequest || mongoose.model('SportRequest', SportRequestSchema);
