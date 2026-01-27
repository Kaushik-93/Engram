import { embed, embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { getSupabase } from '../supabase';

const embeddingModel = google.embedding('gemini-embedding-001');


export interface TextChunk {
    content: string;
    pageNumber: number;
}

// Generate chunks from text (page-based chunking)
export function generateChunks(text: string, pageNumber: number): TextChunk[] {
    // Split by sentences for better semantic chunking
    const sentences = text
        .trim()
        .split(/[.!?]+/)
        .filter(s => s.trim().length > 20); // Filter out very short fragments

    // Group sentences into chunks of ~3-5 sentences
    const chunks: TextChunk[] = [];
    const sentencesPerChunk = 4;

    for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
        const chunk = sentences
            .slice(i, i + sentencesPerChunk)
            .join('. ')
            .trim();

        if (chunk.length > 0) {
            chunks.push({
                content: chunk + '.', // Add back the period
                pageNumber,
            });
        }
    }

    // If no chunks were created (e.g., very short text), return the whole text as one chunk
    if (chunks.length === 0 && text.trim().length > 0) {
        chunks.push({ content: text.trim(), pageNumber });
    }

    return chunks;
}

// Generate a single embedding
export async function generateEmbedding(value: string): Promise<number[]> {
    const input = value.replaceAll('\\n', ' ');
    const { embedding } = await embed({
        model: embeddingModel,
        value: input,
    });
    return embedding;
}

// Generate multiple embeddings
export async function generateEmbeddings(
    chunks: TextChunk[]
): Promise<Array<{ content: string; pageNumber: number; embedding: number[] }>> {
    const values = chunks.map(c => c.content);
    const { embeddings } = await embedMany({
        model: embeddingModel,
        values,
    });

    return embeddings.map((embedding, i) => ({
        content: chunks[i].content,
        pageNumber: chunks[i].pageNumber,
        embedding,
    }));
}

// Find similar content using vector search
export async function findSimilarContent(
    query: string,
    bookId: string,
    limit: number = 7
): Promise<Array<{ content: string; page_number: number; similarity: number }>> {
    const supabase = getSupabase();

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Use Supabase's vector similarity search
    const { data, error } = await supabase.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_book_id: bookId,
        match_count: limit,
        similarity_threshold: 0.5,
    });

    if (error) {
        console.error('Error finding similar content:', error);
        return [];
    }

    return data || [];
}

// Save embeddings to database
export async function saveEmbeddings(
    bookId: string,
    embeddings: Array<{ content: string; pageNumber: number; embedding: number[] }>
): Promise<void> {
    const supabase = getSupabase();

    const records = embeddings.map(e => ({
        book_id: bookId,
        content: e.content,
        page_number: e.pageNumber,
        embedding: e.embedding,
    }));

    const { error } = await supabase.from('embeddings').insert(records);

    if (error) {
        console.error('Error saving embeddings:', error);
        throw new Error('Failed to save embeddings');
    }
}
