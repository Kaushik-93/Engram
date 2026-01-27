import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const { question, correctAnswer, userAnswer } = await request.json();

        if (!question || !correctAnswer || !userAnswer) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prompt = `
You remain an expert tutor.
Evaluate the user's answer to a flashcard question.

Question: ${question}
Correct Answer (from text): ${correctAnswer}
User's Answer: ${userAnswer}

Compare the meaning. If the user is correct (even if worded differently), mark as correct.
Provide brief, encouraging feedback. If incorrect, explain why and highlight the key concept missed.
`;

        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                isCorrect: z.boolean(),
                feedback: z.string().describe("Brief feedback explaining why it is correct or incorrect"),
                score: z.number().min(0).max(10).describe("A score from 0 to 10 based on accuracy"),
            }),
            prompt: prompt,
        });

        return NextResponse.json(object);
    } catch (error: any) {
        console.error("AI Evaluation Error:", error);
        return NextResponse.json({
            error: "Failed to evaluate answer",
            details: error.message
        }, { status: 500 });
    }
}
