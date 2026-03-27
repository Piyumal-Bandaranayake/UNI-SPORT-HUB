import mongoose from 'mongoose';

const EquipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    available: { type: Number, required: true, default: 0 },
    condition: { type: String, enum: ["NEW", "GOOD", "FAIR", "POOR"], default: "GOOD" },
    status: { type: String, enum: ["AVAILABLE", "OUT_OF_STOCK", "MAINTENANCE"], default: "AVAILABLE" },
    image: { type: String, default: "" },
    lastUpdatedBy: { type: String, required: true }, // University ID
}, { timestamps: true });

export default mongoose.models.Equipment || mongoose.model('Equipment', EquipmentSchema);
