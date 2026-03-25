import mongoose from 'mongoose';

const SubAdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    managedSports: { type: [String], default: [] },
}, { timestamps: true });

if (mongoose.models.SubAdmin) {
    delete mongoose.models.SubAdmin;
}

export default mongoose.model('SubAdmin', SubAdminSchema);
