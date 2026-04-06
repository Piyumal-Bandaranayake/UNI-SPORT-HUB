import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import AiMealPlan from "@/models/AiMealPlan";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const today = new Date().toISOString().split('T')[0];

        const mealPlan = await AiMealPlan.findOne({ studentId: session.user.id, date: today });
        
        return NextResponse.json({ mealPlan });
    } catch (error) {
        console.error("Error fetching AI meal plan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { requirements, details } = await req.json();

        if (!requirements || !details) {
            return NextResponse.json({ error: "Requirements and details are needed" }, { status: 400 });
        }

        await dbConnect();
        const today = new Date().toISOString().split('T')[0];

        // Check if one already exists
        const existing = await AiMealPlan.findOne({ studentId: session.user.id, date: today });
        if (existing) {
            await AiMealPlan.deleteOne({ _id: existing._id });
        }

        const prompt = `You are a professional sports nutritionist. Generate a JSON response for a daily meal plan based on these student requirements.
User Details: ${details}
User Goal/Requirements: ${requirements}

Provide 4 meals (Breakfast, Lunch, Pre-Workout or Snack, Dinner). Ensure total calories and macros align with the user's goal.
Make sure the output is pure JSON matching this exact structure:
{
  "goal": "Short string like 'Bulking Season' or 'Fat Loss'",
  "meals": [
    { "meal": "Breakfast", "items": "item line", "time": "08:00 AM", "cal": "450" }
  ],
  "hydration": {
    "target": 3.5
  },
  "balance": {
    "protein": "180g",
    "carbs": "240g",
    "fats": "65g"
  }
}

Respond ONLY with valid JSON. Do not use markdown wrappers, just raw JSON.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const parsed = JSON.parse(text);

        const newMealPlan = await AiMealPlan.create({
            studentId: session.user.id,
            date: today,
            goal: parsed.goal,
            meals: parsed.meals,
            hydration: { current: 0, target: parsed.hydration.target },
            balance: parsed.balance
        });

        return NextResponse.json({ mealPlan: newMealPlan });

    } catch (error) {
        console.error("Error generating AI meal plan:", error);
        return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { amount } = await req.json();

        await dbConnect();
        const today = new Date().toISOString().split('T')[0];
        const plan = await AiMealPlan.findOne({ studentId: session.user.id, date: today });

        if (!plan) {
             return NextResponse.json({ error: "No plan found today." }, { status: 404 });
        }

        plan.hydration.current = Number((plan.hydration.current + amount).toFixed(2));
        await plan.save();

        return NextResponse.json({ mealPlan: plan });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update hydration." }, { status: 500 });
    }
}
