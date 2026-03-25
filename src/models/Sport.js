import mongoose from 'mongoose';

const SportSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
}, { timestamps: true });

if (mongoose.models.Sport) {
    delete mongoose.models.Sport;
}

export default mongoose.model('Sport', SportSchema);
