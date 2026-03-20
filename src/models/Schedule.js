import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema({
    sportName: { type: String, required: true },
    coachUniversityId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    activity: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
