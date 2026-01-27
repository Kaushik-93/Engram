import { NextRequest, NextResponse } from "next/server";
import { findSimilarContent } from "@/lib/ai/embedding";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, bookId, limit = 7 } = body;

        if (!query || !bookId) {
            return NextResponse.json(
                { error: "Missing required fields: query, bookId" },
                { status: 400 }
            );
        }

        const results = await findSimilarContent(query, bookId, limit);

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Error searching embeddings:", error);
        return NextResponse.json(
            { error: "Failed to search embeddings" },
            { status: 500 }
        );
    }
}
