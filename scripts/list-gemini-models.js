import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    console.log("Fetching available Gemini models...\n");
    
    try {
        const models = await genAI.listModels();
        console.log("Available models:");
        models.forEach(model => {
            console.log(`- ${model.name}`);
            console.log(`  Display Name: ${model.displayName}`);
            console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(", ")}`);
            console.log("");
        });
    } catch (error) {
        console.error("Error listing models:", error.message);
        console.error("\nThis might indicate:");
        console.error("1. Invalid API key");
        console.error("2. API key doesn't have proper permissions");
        console.error("3. Network connectivity issues");
        console.error("\nPlease verify your GEMINI_API_KEY in .env.local");
    }
}

listModels();
