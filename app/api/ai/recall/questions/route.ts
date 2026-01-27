import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const { flashcards, highlights, bookTitle } = await request.json();

        if (!flashcards && !highlights) {
            return NextResponse.json({ error: "Missing content for question generation" }, { status: 400 });
        }

        const prompt = `
You are an expert educational psychologist specializing in active recall and spaced repetition.
Your goal is to generate a set of challenging reinforcement questions based on the provided flashcards and highlights from the book "${bookTitle || 'the document'}".

Content provided:
- Flashcards (Question/Answer pairs):
${flashcards?.map((f: any) => `- Q: ${f.front} | A: ${f.back}`).join('\n') || 'None'}

- Notes/Highlights (Key snippets):
${highlights?.map((h: any) => `- ${h.text}`).join('\n') || 'None'}

Generate exactly 5 high-quality questions that:
1. Synthesize information across different flashcards/highlights where possible.
2. Focus on "Why" and "How" rather than just "What".
3. Include a mix of:
   - "Conceptual" questions (Explain how X relates to Y)
   - "Scenario-based" questions (If Z happened, how would X apply?)
   - "Gap-filling" questions (Connect these two disparate ideas from the notes)

For each question, provide a "Correct Reference" which is what a perfect answer should contain.
`;

        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                questions: z.array(z.object({
                    id: z.string(),
                    question: z.string(),
                    type: z.enum(["conceptual", "scenario", "synthesis"]),
                    correctReference: z.string(),
                    hint: z.string(),
                })).length(5),
            }),
            prompt: prompt,
        });

        return NextResponse.json({ questions: object.questions });
    } catch (error: any) {
        console.error("AI Question Generation Error:", error);
        return NextResponse.json({
            error: "Failed to generate recall questions",
            details: error.message
        }, { status: 500 });
    }
}
