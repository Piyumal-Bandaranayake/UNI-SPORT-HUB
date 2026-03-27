import mongoose from 'mongoose';

const EquipmentBookingSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // University ID
    userEmail: { type: String, required: true },
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    equipmentName: { type: String, required: true },
    sportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    sportName: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "ACTIVE", "RETURNED", "EXPIRED"], default: "PENDING" },
    qrCode: { type: String },
    bookingDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.EquipmentBooking || mongoose.model('EquipmentBooking', EquipmentBookingSchema);
