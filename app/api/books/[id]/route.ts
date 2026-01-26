import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET single book
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabase();
        const { id } = await params;

        const { data, error } = await supabase
            .from("books")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching book:", error);
        return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 });
    }
}

// PATCH update book
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabase();
        const { id } = await params;
        const body = await request.json();

        const { data, error } = await supabase
            .from("books")
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating book:", error);
        return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
    }
}

// DELETE book
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabase();
        const { id } = await params;

        // Delete from book_files first (cascade should handle this, but being explicit)
        await supabase.from("book_files").delete().eq("id", id);

        // Delete highlights
        await supabase.from("highlights").delete().eq("book_id", id);

        // Delete book
        const { error } = await supabase.from("books").delete().eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting book:", error);
        return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
    }
}
