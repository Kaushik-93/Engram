import "@/lib/polyfill-pdf"; // Must be first
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { compressBase64 } from "@/lib/compression";
import { generateChunks, generateEmbeddings, saveEmbeddings } from "@/lib/ai/embedding";
import * as pdfjs from "pdfjs-dist/build/pdf.mjs";

// Set up PDF.js worker for server-side
if (typeof window === 'undefined') {
    // Use standard build worker
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

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

        // Extract text from PDF and create embeddings (run in background)
        try {
            // Decode base64 to Uint8Array for PDF.js - strip prefix if exists
            const base64Payload = fileData.split(",")[1] || fileData;
            const buffer = Buffer.from(base64Payload, 'base64');
            const pdfData = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
            const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
            const allChunks = [];

            // Update total pages
            await supabase
                .from("books")
                .update({ total_pages: pdf.numPages })
                .eq("id", book.id);

            // Extract text from each page and generate chunks
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const text = textContent.items.map((item: any) => item.str).join(" ");

                const pageChunks = generateChunks(text, i);
                allChunks.push(...pageChunks);
            }

            // Generate embeddings for all chunks
            if (allChunks.length > 0) {
                const embeddings = await generateEmbeddings(allChunks);
                await saveEmbeddings(book.id, embeddings);
                console.log(`Created ${embeddings.length} embeddings for book ${book.id}`);
            }
        } catch (embeddingError) {
            // Don't fail the book creation if embedding fails
            console.error("Error creating embeddings:", embeddingError);
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
