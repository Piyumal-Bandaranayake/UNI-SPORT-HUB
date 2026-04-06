import mongoose from "mongoose";

const MealItemSchema = new mongoose.Schema({
    meal: { type: String, required: true },
    items: { type: String, required: true },
    time: { type: String, required: true },
    cal: { type: String, required: true }
}, { _id: false });

const AiMealPlanSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    date: { type: String, required: true }, // e.g. "2026-04-06"
    goal: { type: String, required: true }, // e.g. "Bulking Season"
    meals: [MealItemSchema],
    hydration: {
        current: { type: Number, default: 0 },
        target: { type: Number, required: true }
    },
    balance: {
        protein: { type: String, required: true },
        carbs: { type: String, required: true },
        fats: { type: String, required: true }
    }
}, { timestamps: true });

export default mongoose.models.AiMealPlan || mongoose.model("AiMealPlan", AiMealPlanSchema);
