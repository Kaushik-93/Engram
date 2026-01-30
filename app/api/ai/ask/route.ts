import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { AI_CONFIG } from "@/lib/ai-config";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const { messages, context } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "Missing messages" }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        const question = lastMessage.content || lastMessage.text ||
            (lastMessage.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(''));

        const contextToUse = context || "No specific context chunks found for this query.";

        const prompt = `
You are a helpful study assistant.Answer the user's question using the provided context from the textbook/PDF.
If the context is helpful, prioritize it.If you cannot find the answer in the context, use your general knowledge but mention that it was not in the specific text provided.

    Context:
${contextToUse}

User Question:
${question}
`;

        const result = await streamText({
            model: google(AI_CONFIG.defaultModel),
            prompt: prompt,
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("AI Q&A Error:", error);
        return NextResponse.json({
            error: "Failed to generate answer",
            details: error.message
        }, { status: 500 });
    }
}
