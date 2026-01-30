"use client";

import React, { useEffect, useState } from "react";
import { RecallCard } from "@/components/recall/RecallCard";
import { Loader2, CheckCircle2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface RecallItem {
    id: string;
    concept_text: string;
    clue_text?: string;
    book: { title: string };
}

export default function RecallFeedPage() {
    const router = useRouter();
    const [items, setItems] = useState<RecallItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchItems() {
            try {
                const res = await fetch("/api/recall"); // Filters for due items
                const data = await res.json();
                if (Array.isArray(data)) {
                    setItems(data);
                }
            } catch (err) {
                console.error(err);
                // Mock data for demo if API fails or empty
                setItems([
                    { id: "1", concept_text: "The powerhouse of the cell", clue_text: "Mitochondria", book: { title: "Biology 101" } },
                    { id: "2", concept_text: "Area = πr²", clue_text: "Circle Area Formula", book: { title: "Math Basics" } }
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, []);

    const handleRate = async (itemId: string, score: number) => {
        // Send rating to API
        try {
            await fetch("/api/recall", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, score })
            });
        } catch (e) {
            console.error(e);
        }

        // Advance to next
        setCurrentIndex(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (currentIndex >= items.length) {
        return (
            <div className="h-screen flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-700">
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-16 w-16 text-primary animate-bounce" />
                </div>
                <h1 className="text-3xl font-black">Daily Recall Complete!</h1>
                <p className="text-muted-foreground">You've strengthened {items.length} neural pathways today.</p>
                <Button onClick={() => router.push("/library")} size="lg" className="rounded-xl font-bold">
                    Return to Library
                </Button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <header className="p-8 text-center">
                <h1 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/50">Recall Feed</h1>
                <p className="text-xs font-bold text-primary mt-2">Item {currentIndex + 1} of {items.length}</p>
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <RecallCard
                    key={items[currentIndex].id} // Key to force re-render/reset state
                    item={items[currentIndex]}
                    onRate={handleRate}
                />
            </main>
        </div>
    );
}
