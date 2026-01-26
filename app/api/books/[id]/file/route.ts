import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { decompressBase64 } from "@/lib/compression";

// GET book file (decompressed)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabase();
        const { id } = await params;

        const { data, error } = await supabase
            .from("book_files")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // Decompress the file data
        const fileData = decompressBase64(data.data);

        return NextResponse.json({
            fileData,
            originalSize: data.original_size,
            compressedSize: data.compressed_size,
        });
    } catch (error) {
        console.error("Error fetching book file:", error);
        return NextResponse.json({ error: "Failed to fetch book file" }, { status: 500 });
    }
}
