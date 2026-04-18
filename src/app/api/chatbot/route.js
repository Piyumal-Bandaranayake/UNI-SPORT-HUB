import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are UniBot, the friendly AI assistant for UniSportHub — a university sports management platform.

You help users with:
- Sports bookings (equipment and court bookings)
- Joining sports teams and checking application status
- Training schedules and exercise plans
- Meal plans and nutrition advice
- Notifications and announcements
- General platform navigation (dashboard, login, registration)
- Coach consultations and exercise session scheduling
- Sport events and achievements

Keep responses concise, friendly, and helpful. If a question is unrelated to sports or the platform, politely redirect the user to relevant platform features.`;

export async function POST(req) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Build chat history (exclude the last user message — that's the current prompt)
        const history = messages.slice(0, -1).map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Understood! I'm UniBot, ready to help UniSportHub users." }] },
                ...history,
            ],
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const reply = result.response.text();

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("[Chatbot API] Error:", error);
        return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
    }
}
