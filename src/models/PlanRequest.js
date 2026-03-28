import mongoose from "mongoose";

const PlanRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true },
    type: { type: String, enum: ["EXERCISE", "MEAL"], required: true },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: "Coach" },
    details: { type: String, required: true },
    contactNumber: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
}, { timestamps: true });

export default mongoose.models.PlanRequest || mongoose.model("PlanRequest", PlanRequestSchema);
