"use client";

import * as React from "react";
import { CheckCircle2, Target, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionReviewProps {
    evaluation: { isCorrect: boolean; feedback: string; score: number } | null;
    currentQuestion: any;
    confidence: number;
    setConfidence: (confidence: number) => void;
    onRetry: () => void;
    onNext: () => void;
}

export function SessionReview({
    evaluation,
    currentQuestion,
    confidence,
    setConfidence,
    onRetry,
    onNext
}: SessionReviewProps) {
    if (!evaluation) return null;

    return (
        <div className="w-full space-y-12">
            <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 text-center">Neural Evaluation Feedback</h3>
                <div className={cn(
                    "p-10 rounded-[48px] border shadow-2xl relative overflow-hidden group transition-all duration-700 max-w-2xl mx-auto",
                    evaluation.isCorrect ? "bg-green-500/[0.03] border-green-500/20 shadow-green-500/5" : "bg-red-500/[0.03] border-red-500/20 shadow-red-500/5"
                )}>
                    <div className="absolute top-0 right-0 p-10 text-primary/5 transform -rotate-12 opacity-50">
                        {evaluation.isCorrect ? <CheckCircle2 size={160} /> : <Target size={160} />}
                    </div>
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "h-16 w-16 rounded-3xl flex items-center justify-center font-black text-2xl border shadow-lg",
                                evaluation.isCorrect ? "bg-green-500/20 text-green-700 border-green-500/20" : "bg-red-500/20 text-red-700 border-red-500/20"
                            )}>
                                {evaluation.score}
                            </div>
                            <div>
                                <h4 className="text-2xl font-black tracking-tight mb-1">
                                    {evaluation.isCorrect ? "Insight Verified" : "Path Incomplete"}
                                </h4>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Accuracy Score / 10.0</p>
                            </div>
                        </div>
                        <p className="text-xl font-medium leading-[1.6] text-foreground/90">
                            {evaluation.feedback}
                        </p>
                        <div className="pt-8 border-t border-border/40">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Ideal Concept Coverage</p>
                            </div>
                            <p className="text-base font-medium italic text-muted-foreground leading-relaxed">
                                {currentQuestion.correctReference}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-10 flex flex-col md:flex-row gap-6 max-w-2xl mx-auto w-full">
                <div className="flex-1 space-y-6 bg-muted/20 p-8 rounded-[32px] border border-border/40">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Recall Confidence</h4>
                            <p className="text-xs text-muted-foreground font-medium">How clear was this retrieve?</p>
                        </div>
                        <span className="text-4xl font-black text-primary tabular-nums tracking-tighter">{confidence}%</span>
                    </div>
                    <div className="px-1">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={confidence}
                            onChange={(e) => setConfidence(parseInt(e.target.value))}
                            className="w-full h-2.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 flex-1 justify-center">
                    <Button
                        variant="outline"
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] gap-3 border-border/60 hover:bg-card transition-all"
                        onClick={onRetry}
                    >
                        <RefreshCw size={16} /> Re-Attempt Synthesis
                    </Button>
                    <Button
                        className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-2xl shadow-primary/25 hover:scale-[1.05] active:scale-95 transition-all"
                        onClick={onNext}
                    >
                        Next Intelligence Path <ChevronRight size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
