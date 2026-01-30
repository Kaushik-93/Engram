import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { AI_CONFIG } from "@/lib/ai-config";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const { title, context } = await request.json();

        if (!title) {
            return NextResponse.json({ error: "Missing book title" }, { status: 400 });
        }

        const prompt = `
You are an expert cognitive science tutor designed to prime a student's brain before they start reading.
The goal is to activate prior knowledge and create curiosity gaps.

Book Title: ${title}
Context/Excerpt: ${context || "No context provided, infer from title generally."}

Generate:
1. 3 guiding questions that probe deep understanding (not just factual recall).
2. 1 "curiosity hook" that highlights a common misconception or surprising fact related to this topic (e.g., "Most people think X, but actually Y...").
3. 5 key concepts that are central to this topic.
4. A likely style of exam question this topic usually generates (e.g., "Compare and Contrast", "Derivation", "Case Study").
`;


        // ...
        const { object } = await generateObject({
            model: google(AI_CONFIG.reasoningModel),
            schema: z.object({
                guidingQuestions: z.array(z.string()).describe("3 thought-provoking questions"),
                curiosityHook: z.string().describe("A statement that challenges common beliefs or piques interest"),
                keyConcepts: z.array(z.string()).describe("5 main concepts"),
                examStyle: z.string().describe("The type of exam question common for this topic"),
            }),
            prompt: prompt,
        });

        return NextResponse.json(object);
    } catch (error: any) {
        console.error("Priming AI Error:", error);
        return NextResponse.json({
            error: "Failed to generate priming content",
            details: error.message
        }, { status: 500 });
    }
}
