import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import CourtBooking from "@/models/CourtBooking";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sportId, bookingDate, sportName } = await req.json();

        if (!sportId || !bookingDate) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        await dbConnect();

        // 1. Fetch current bookings
        const dayBookings = await CourtBooking.find({
            sportId,
            bookingDate,
            status: { $in: ["CONFIRMED", "PENDING"] }
        }).lean();

        // 2. Define all possible slots (up to 10 PM)
        const allSlots = [
            "08:00", "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00", "17:00",
            "18:00", "19:00", "20:00", "21:00"
        ];

        const slotCounts = {};
        allSlots.forEach(slot => slotCounts[slot] = 0);
        dayBookings.forEach(b => {
            if (slotCounts[b.timeSlot] !== undefined) {
                slotCounts[b.timeSlot]++;
            }
        });

        // 3. Helper to categorized slots
        const categorize = (time) => {
            const hour = parseInt(time.split(":")[0]);
            if (hour < 12) return "Morning";
            if (hour >= 12 && hour < 16) return "Noon";
            return "Evening";
        };

        // 4. AI Analysis Step
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Analyze booking data for ${sportName} on ${bookingDate}. 
                Current occupancy (out of 2 courts): ${JSON.stringify(slotCounts)}
                
                Pick the BEST SINGLE AVAILABLE time slot for each category:
                1. Morning (08:00-11:00)
                2. Noon (12:00-15:00)
                3. Evening (16:00-21:00) - strictly no later than 21:00 starting time.

                Format as JSON: [{"time": "HH:00", "reason": "Short reason", "score": 1-100}]
                Return exactly 3 objects.
            `;

            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().replace(/```json|```/g, "").trim();
                const suggestions = JSON.parse(text);
                return NextResponse.json({ suggestions });
            } catch (aiErr) {
                console.error("AI Error:", aiErr);
            }
        }

        // FALLBACK LOGIC (Balanced Selection)
        const categories = ["Morning", "Noon", "Evening"];
        const suggestions = categories.map(cat => {
            const catSlots = allSlots.filter(s => categorize(s) === cat && slotCounts[s] < 2);
            if (catSlots.length === 0) return null;
            
            // Pick most available and best rated
            const candidates = catSlots.map(slot => {
                let reason = "Standard availability";
                let score = 80;
                const hour = parseInt(slot.split(":")[0]);
                
                if (cat === "Morning") {
                    reason = "Quiet morning atmosphere";
                    score = hour >= 9 ? 95 : 85;
                } else if (cat === "Noon") {
                    reason = "Mid-day break - high availability";
                    score = 98;
                } else if (cat === "Evening") {
                    reason = "Perfect artificial lighting session";
                    score = hour < 20 ? 92 : 75;
                }
                
                return { time: slot, reason, score };
            }).sort((a, b) => b.score - a.score);

            return candidates[0];
        }).filter(Boolean);

        return NextResponse.json({ suggestions });

    } catch (error) {
        console.error("[AI Suggestion API] Error:", error);
        return NextResponse.json({ error: "AI Engine error" }, { status: 500 });
    }
}
