import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    registrationUrl: { type: String }, // Optional Google Form link
    type: { type: String, enum: ["TRAINING", "MATCH", "TOURNAMENT", "MEETING"], default: "TRAINING" },
    status: { type: String, enum: ["UPCOMING", "LIVE", "COMPLETED", "CANCELLED"], default: "UPCOMING" },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    createdBy: { type: String, required: true } // universityId
}, { timestamps: true });

if (mongoose.models.Event) {
    delete mongoose.models.Event;
}

export default mongoose.model('Event', EventSchema);
