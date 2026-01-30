import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { AI_CONFIG } from "@/lib/ai-config";

export const maxDuration = 60; // Allow 60 seconds for generation

export async function POST(request: NextRequest) {
    try {
        const { text, context } = await request.json();

        if (!text) {
            return NextResponse.json({ error: "Missing text content" }, { status: 400 });
        }

        const prompt = `
You are an expert tutor creating study flashcards.
Create a set of high-quality flashcards based on the following text.
The flashcards should test understanding of key concepts, definitions, and relationships.
Keep the front concise (question/term) and the back clear and comprehensive (answer/definition).

Context from surrounding pages (for reference only, prioritize the main text):
${context || "No additional context provided."}

Main Text to converting to flashcards:
${text}
`;


        // ...
        const { object } = await generateObject({
            model: google(AI_CONFIG.defaultModel),
            schema: z.object({
                flashcards: z.array(z.object({
                    front: z.string().describe("The question or term on the front of the card"),
                    back: z.string().describe("The comprehensive answer or definition on the back"),
                })).describe("List of generated flashcards"),
            }),
            prompt: prompt,
        });

        return NextResponse.json({ flashcards: object.flashcards });
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({
            error: "Failed to generate flashcards",
            details: error.message
        }, { status: 500 });
    }
}
