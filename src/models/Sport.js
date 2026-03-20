import mongoose from 'mongoose';

const SportSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
}, { timestamps: true });

export default mongoose.models.Sport || mongoose.model('Sport', SportSchema);
