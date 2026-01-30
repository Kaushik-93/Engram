import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { AI_CONFIG } from "@/lib/ai-config";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const { text, userExplanation, context } = await request.json();

        if (!text || !userExplanation) {
            return NextResponse.json({ error: "Missing text or user explanation" }, { status: 400 });
        }

        const prompt = `
You are a strict but fair professor. A student has just read the following text and is trying to explain it in their own words (Feynman Technique).

Original Text:
${text}

User's Explanation:
${userExplanation}

Context:
${context || "N/A"}

Evaluate the explanation:
1. Is it accurate? (Pass/Fail)
2. What key concepts were missed?
3. Give brief feedback (1-2 sentences) on how to improve.
4. If "Fail", provide a specific "Socratic Question" to nudge them in the right direction without giving the answer.
`;


        // ...
        const { object } = await generateObject({
            model: google(AI_CONFIG.reasoningModel),
            schema: z.object({
                isAccurate: z.boolean().describe("True if the explanation captures the core meaning accurately"),
                coverageScore: z.number().min(0).max(100).describe("0-100 score of how much nuance was captured"),
                feedback: z.string().describe("Brief, constructive feedback"),
                missingConcepts: z.array(z.string()).describe("List of important concepts they missed"),
                socraticQuestion: z.string().optional().describe("A question to guide them if they missed the mark"),
            }),
            prompt: prompt,
        });

        return NextResponse.json(object);
    } catch (error: any) {
        console.error("Explanation Eval Error:", error);
        return NextResponse.json({
            error: "Failed to evaluate explanation",
            details: error.message
        }, { status: 500 });
    }
}
