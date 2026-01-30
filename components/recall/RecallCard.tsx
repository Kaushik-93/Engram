"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Repeat, ThumbsUp, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecallItem {
    id: string;
    concept_text: string;
    clue_text?: string;
    book: { title: string };
}

interface RecallCardProps {
    item: RecallItem;
    onRate: (itemId: string, score: number) => void;
}

export function RecallCard({ item, onRate }: RecallCardProps) {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div className="w-full max-w-md mx-auto perspective-[1000px] h-96 group cursor-pointer" onClick={() => !isRevealed && setIsRevealed(true)}>
            <div className={cn(
                "relative w-full h-full transition-all duration-700 transform-style-3d",
                isRevealed ? "rotate-y-180" : ""
            )}>
                {/* FRONT */}
                <Card className="absolute inset-0 backface-hidden p-8 flex flex-col items-center justify-center text-center space-y-4 border-2 border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{item.book?.title || "General Knowledge"}</p>
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                        {item.clue_text || "Recall Concept"}
                    </h3>
                    <p className="text-sm text-muted-foreground animate-pulse mt-8">Click to reveal</p>
                </Card>

                {/* BACK */}
                <Card className="absolute inset-0 backface-hidden rotate-y-180 p-8 flex flex-col items-center justify-center text-center space-y-6 border-2 border-primary bg-card shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
                    <p className="text-lg font-medium">{item.concept_text}</p>

                    <div className="grid grid-cols-4 gap-2 w-full pt-8" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="outline"
                            className="flex-col h-16 gap-1 border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => onRate(item.id, 0)}
                        >
                            <Repeat size={16} />
                            <span className="text-[9px] uppercase font-bold">Again</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-col h-16 gap-1 border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-500"
                            onClick={() => onRate(item.id, 0.5)}
                        >
                            <Zap size={16} />
                            <span className="text-[9px] uppercase font-bold">Hard</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-col h-16 gap-1 border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-500"
                            onClick={() => onRate(item.id, 0.8)}
                        >
                            <ThumbsUp size={16} />
                            <span className="text-[9px] uppercase font-bold">Good</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-col h-16 gap-1 border-green-500/20 hover:bg-green-500/10 hover:text-green-500"
                            onClick={() => onRate(item.id, 1)}
                        >
                            <Medal size={16} />
                            <span className="text-[9px] uppercase font-bold">Easy</span>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
