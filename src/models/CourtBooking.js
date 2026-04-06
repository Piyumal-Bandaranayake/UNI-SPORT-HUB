import mongoose from 'mongoose';

const CourtBookingSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // University ID / IT Number
    userEmail: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    sportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    sportName: { type: String, required: true },
    courtLocation: { type: String, enum: ['Court 1', 'Court 2'], required: true },
    bookingDate: { type: String, required: true }, // Format YYYY-MM-DD
    timeSlot: { type: String, required: true }, // e.g., "14:00" mapping to an hour slot
    status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "CONFIRMED" },
    qrCode: { type: String }, // base64 data URL
}, { timestamps: true });

// Prevent mongoose from using the cached model with the old schema (without qrCode) in development
if (mongoose.models.CourtBooking) {
  delete mongoose.models.CourtBooking;
}

export default mongoose.model('CourtBooking', CourtBookingSchema);
