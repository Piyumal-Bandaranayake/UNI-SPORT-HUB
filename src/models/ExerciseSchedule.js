import mongoose from 'mongoose';

const ExerciseScheduleSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true },
    studentName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    freeTime: { type: String, required: true },
    sessionType: { type: String, enum: ["ONLINE", "PHYSICAL"], required: true },
    meetingLink: { type: String },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"], default: "PENDING" }
}, { timestamps: true });

export default mongoose.models.ExerciseSchedule || mongoose.model('ExerciseSchedule', ExerciseScheduleSchema);
