"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionHeaderProps {
    currentIndex: number;
    totalQuestions: number;
    onExit: () => void;
}

export function SessionHeader({ currentIndex, totalQuestions, onExit }: SessionHeaderProps) {
    const questionCount = totalQuestions || 5;
    const questionsArray = totalQuestions > 0 ? Array(totalQuestions).fill(0) : [1, 2, 3, 4, 5];

    return (
        <div className="w-full flex items-center justify-between mb-16 px-2">
            <Button
                variant="ghost"
                size="sm"
                className="rounded-full gap-2 text-muted-foreground hover:text-foreground h-10 px-4 transition-all"
                onClick={onExit}
            >
                <ArrowLeft size={16} /> Dashboard
            </Button>

            <div className="flex flex-col items-center gap-2.5">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 translate-x-[0.1em]">
                    Session Progress
                </span>
                <div className="flex gap-2">
                    {questionsArray.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-700",
                                i === currentIndex
                                    ? "bg-primary w-10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
                                    : i < currentIndex
                                        ? "bg-primary/40 w-4"
                                        : "bg-muted w-4"
                            )}
                        />
                    ))}
                </div>
            </div>

            <div className="w-32 text-right">
                <div className="inline-flex items-baseline gap-1 bg-muted/30 px-3 py-1 rounded-full border border-border/40">
                    <span className="text-sm font-black text-primary tabular-nums">
                        {currentIndex + 1}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">/</span>
                    <span className="text-[10px] font-bold text-muted-foreground">
                        {questionCount}
                    </span>
                </div>
            </div>
        </div>
    );
}
