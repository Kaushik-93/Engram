import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { compressBase64 } from "@/lib/compression";

// GET all books
export async function GET() {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("books")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching books:", error);
        return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
    }
}

// POST create new book with file
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const body = await request.json();
        const { title, fileName, fileData } = body;

        if (!title || !fileName || !fileData) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Compress the file data
        const { compressed, originalSize, compressedSize } = compressBase64(fileData);

        // Create book record
        const { data: book, error: bookError } = await supabase
            .from("books")
            .insert({
                title,
                file_name: fileName,
                total_pages: 0,
                last_read_page: 1,
            })
            .select()
            .single();

        if (bookError) throw bookError;

        // Store compressed file data
        const { error: fileError } = await supabase
            .from("book_files")
            .insert({
                id: book.id,
                data: compressed,
                original_size: originalSize,
                compressed_size: compressedSize,
            });

        if (fileError) {
            // Rollback book creation
            await supabase.from("books").delete().eq("id", book.id);
            throw fileError;
        }

        return NextResponse.json({
            ...book,
            compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(1) + "%",
        });
    } catch (error) {
        console.error("Error creating book:", error);
        return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
    }
}
