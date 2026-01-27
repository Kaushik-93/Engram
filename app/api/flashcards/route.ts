import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET flashcards (optionally filtered by bookId)
export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const bookId = searchParams.get("bookId");

        // Use any to bypass strict type checking during development/migrations
        let query = supabase.from("flashcards" as any).select("*");

        if (bookId) {
            query = query.eq("book_id", bookId);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching flashcards:", error);
        return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 });
    }
}

// POST create flashcard
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const body = await request.json();
        const { bookId, highlightId, front, back } = body;

        if (!bookId || !front || !back) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("flashcards" as any)
            .insert({
                book_id: bookId,
                highlight_id: highlightId || null,
                front,
                back,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error creating flashcard:", error);
        return NextResponse.json({
            error: "Failed to create flashcard",
            message: error.message
        }, { status: 500 });
    }
}

// DELETE flashcard
export async function DELETE(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing flashcard ID" }, { status: 400 });
        }

        const { error } = await supabase.from("flashcards" as any).delete().eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting flashcard:", error);
        return NextResponse.json({ error: "Failed to delete flashcard" }, { status: 500 });
    }
}
