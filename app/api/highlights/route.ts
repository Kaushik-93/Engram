import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET highlights (optionally filtered by bookId)
export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const bookId = searchParams.get("bookId");

        let query = supabase.from("highlights").select("*");

        if (bookId) {
            query = query.eq("book_id", bookId);
        }

        const { data, error } = await query.order("page_number", { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching highlights:", error);
        return NextResponse.json({ error: "Failed to fetch highlights" }, { status: 500 });
    }
}

// POST create highlight
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const body = await request.json();
        const { bookId, text, pageNumber, position, color = "primary" } = body;

        if (!bookId || !text || !pageNumber) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("highlights")
            .insert({
                book_id: bookId,
                text,
                page_number: pageNumber,
                position_x: position?.x || 0,
                position_y: position?.y || 0,
                position_width: position?.width || 0,
                position_height: position?.height || 0,
                color,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("--- Critical Error Creating Highlight ---");
        console.error("Error Message:", error.message);
        console.error("Error Details:", error.details || "No extra details");
        console.error("Error Code:", error.code || "No code");
        console.error("Stack Trace:", error.stack);
        console.error("-----------------------------------------");

        return NextResponse.json({
            error: "Failed to connect to the database. Please check your internet connection.",
            message: error.message
        }, { status: 500 });
    }
}

// DELETE highlight
export async function DELETE(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing highlight ID" }, { status: 400 });
        }

        const { error } = await supabase.from("highlights").delete().eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting highlight:", error);
        return NextResponse.json({ error: "Failed to delete highlight" }, { status: 500 });
    }
}
