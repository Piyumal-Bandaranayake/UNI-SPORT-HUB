import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Coach from "@/models/Coach";
import SubAdmin from "@/models/SubAdmin";
import EquipmentBooking from "@/models/EquipmentBooking";
import CourtBooking from "@/models/CourtBooking";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        // Validate API key
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
            console.error("[AI Chat API] GEMINI_API_KEY not configured");
            return NextResponse.json({ 
                reply: "The AI service is not configured. Please contact the administrator.",
                error: true
            }, { status: 200 });
        }

        const session = await auth();
        const { message, conversationHistory } = await req.json();

        if (!message || !message.trim()) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        await dbConnect();

        // Build context based on user session
        let userContext = "You are UniBot, a helpful AI assistant for UniSportHub - a university sports management platform.";
        let userData = null;

        if (session?.user) {
            const role = session.user.role;
            userContext += `\n\nCurrent user role: ${role}`;
            userContext += `\nUser name: ${session.user.name}`;

            // Fetch user-specific data
            if (role === "STUDENT") {
                userData = await Student.findById(session.user.id)
                    .select("name universityId faculty status")
                    .lean();
                
                const userBookings = await EquipmentBooking.find({ 
                    userId: userData?.universityId,
                    status: { $in: ["CONFIRMED", "PENDING"] }
                }).limit(5).lean();

                const courtBookings = await CourtBooking.find({
                    userId: userData?.universityId,
                    status: { $in: ["CONFIRMED", "PENDING"] }
                }).limit(5).lean();

                userContext += `\nStudent ID: ${userData?.universityId}`;
                userContext += `\nFaculty: ${userData?.faculty}`;
                userContext += `\nActive equipment bookings: ${userBookings.length}`;
                userContext += `\nActive court bookings: ${courtBookings.length}`;
            } else if (role === "COACH") {
                userData = await Coach.findById(session.user.id)
                    .select("name specialization status")
                    .lean();
                userContext += `\nCoach specialization: ${userData?.specialization || "General"}`;
            } else if (role === "SUB_ADMIN") {
                userData = await SubAdmin.findById(session.user.id)
                    .populate("assignedSport", "name")
                    .lean();
                userContext += `\nManaging sport: ${userData?.assignedSport?.name || "Not assigned"}`;
            }
        } else {
            userContext += "\n\nUser is not logged in (guest).";
        }

        // Add platform features context
        userContext += `

Platform Features:
- Sports Management: Browse and join various sports teams
- Court Bookings: Reserve sports courts for specific time slots
- Equipment Bookings: Borrow sports equipment
- Training Schedules: View and manage training sessions
- AI Meal Plans: Get personalized nutrition plans for athletes
- AI Booking Suggestions: Smart time slot recommendations
- Achievements: Track and showcase sports accomplishments
- Notifications: Stay updated on requests and events

Guidelines:
- Be friendly, helpful, and concise
- Provide specific guidance based on user's role
- If asked about bookings/schedules, mention they can check their dashboard
- For technical issues, suggest contacting administration
- Encourage healthy sports participation and wellness
- Keep responses under 150 words unless detailed explanation is needed`;

        // Prepare conversation history for context
        const chatHistory = conversationHistory?.slice(-6) || []; // Last 6 messages for context
        
        // Build conversation context
        let conversationContext = "";
        if (chatHistory.length > 0) {
            conversationContext = "\n\nRecent conversation:\n";
            chatHistory.forEach(msg => {
                conversationContext += `${msg.role === 'user' ? 'User' : 'UniBot'}: ${msg.content}\n`;
            });
        }

        // Combine system context with conversation
        const fullPrompt = `${userContext}\n${conversationContext}\n\nUser: ${message}\n\nUniBot:`;

        // Use the same model as other working AI features (ai-meal-plan, suggest-booking)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash"
        });

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const botReply = response.text();

        return NextResponse.json({ 
            reply: botReply,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("[AI Chat API] Error:", error);
        console.error("[AI Chat API] Error details:", {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            name: error.name
        });
        
        // Fallback response if AI fails
        return NextResponse.json({ 
            reply: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or contact support if the issue persists.",
            error: true
        }, { status: 200 }); // Return 200 to avoid breaking the UI
    }
}
