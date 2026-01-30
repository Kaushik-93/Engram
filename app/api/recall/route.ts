import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    try {
        let query = supabase
            .from("recall_items")
            .select(`
                *,
                book:books(title)
            `)
            .lte("next_due_at", new Date().toISOString()) // Only items due now or in past
            .order("next_due_at", { ascending: true })
            .limit(20);

        if (bookId) {
            query = query.eq("book_id", bookId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const supabase = getSupabase();
    try {
        const { itemId, score } = await request.json(); // score: 0 (fail), 0.5 (hard), 1 (easy)

        if (!itemId || score === undefined) {
            return NextResponse.json({ error: "Missing itemId or score" }, { status: 400 });
        }

        // Fetch current item state
        const { data: item, error: fetchError } = await supabase
            .from("recall_items")
            .select("*")
            .eq("id", itemId)
            .single();

        if (fetchError || !item) throw new Error("Item not found");

        // Simple Spaced Repetition Logic (Exponential Backoff-ish)
        // If score > 0.6: interval * 2.5 (or similar multiplier)
        // If score < 0.6: reset to 0 or 1 day

        let newInterval = item.interval_minutes || 0;
        let stability = item.stability || 1.0;

        // Very basic FSRS-inspired logic placeholder
        // In real app, use full FSRS algorithm
        if (score >= 0.8) {
            // Easy
            newInterval = newInterval === 0 ? 1440 : Math.ceil(newInterval * 2.5); // 1 day if new
            stability += 0.5;
        } else if (score >= 0.5) {
            // Hard
            newInterval = newInterval === 0 ? 720 : Math.ceil(newInterval * 1.5); // 12 hours
        } else {
            // Forgot
            newInterval = 10; // 10 minutes
            stability = Math.max(1.0, stability - 0.2);
        }

        const nextDue = new Date();
        nextDue.setMinutes(nextDue.getMinutes() + newInterval);

        // Update Item
        const { error: updateError } = await supabase
            .from("recall_items")
            .update({
                last_recalled_at: new Date().toISOString(),
                next_due_at: nextDue.toISOString(),
                interval_minutes: newInterval,
                stability: stability,
            })
            .eq("id", itemId);

        if (updateError) throw updateError;

        // Log Attempt
        const { error: logError } = await supabase
            .from("recall_logs")
            .insert({
                recall_item_id: itemId,
                score: score,
                recalled_at: new Date().toISOString(),
            });

        if (logError) console.error("Failed to log recall:", logError);

        return NextResponse.json({ success: true, nextDue, newInterval });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
