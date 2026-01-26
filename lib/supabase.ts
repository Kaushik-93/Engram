import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
        }

        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
}

// For backwards compatibility - but will throw if used at build time
export const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return (getSupabase() as any)[prop];
    }
});

// Database types
export interface DbBook {
    id: string;
    title: string;
    file_name: string;
    total_pages: number;
    last_read_page: number;
    created_at: string;
    updated_at: string;
}

export interface DbBookFile {
    id: string;
    data: string; // Base64 compressed
    original_size: number;
    compressed_size: number;
}

export interface DbHighlight {
    id: string;
    book_id: string;
    text: string;
    page_number: number;
    position_x: number;
    position_y: number;
    position_width: number;
    position_height: number;
    color: string;
    created_at: string;
}
