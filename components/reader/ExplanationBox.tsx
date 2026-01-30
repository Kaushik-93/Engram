"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertTriangle, BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationBoxProps {
    contextText: string; // The text chunk they read
    onPass: () => void; // Called when explanation is good enough
}

export function ExplanationBox({ contextText, onPass }: ExplanationBoxProps) {
    const [explanation, setExplanation] = useState("");
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [feedback, setFeedback] = useState<{
        isAccurate: boolean;
        feedback: string;
        socraticQuestion?: string;
    } | null>(null);

    const handleSubmit = async () => {
        if (!explanation.trim() || !contextText) return;

        setIsEvaluating(true);
        setFeedback(null);

        try {
            const response = await fetch("/api/ai/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: contextText,
                    userExplanation: explanation,
                }),
            });

            if (!response.ok) throw new Error("Evaluation failed");

            const result = await response.json();
            setFeedback(result);

            if (result.isAccurate) {
                // Wait a moment before passing to let user read positive feedback
                setTimeout(() => {
                    onPass();
                }, 2000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl border-l border-border/60 p-6 space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold tracking-[0.2em] uppercase text-[9px]">
                    <BookOpen size={12} />
                    Active Recall Protocol
                </div>
                <h3 className="text-lg font-black tracking-tight">Feynman Technique</h3>
                <p className="text-sm text-muted-foreground">
                    Explain what you just read in your own words. If you can't explain it simpler, you don't understand it well enough.
                </p>
            </div>

            <div className="flex-1 flex flex-col space-y-4">
                <Textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Type your explanation here..."
                    className="flex-1 resize-none bg-background/50 border-primary/20 focus:border-primary/50 text-base"
                    disabled={isEvaluating || (feedback?.isAccurate ?? false)}
                />

                {feedback && (
                    <div className={cn(
                        "p-4 rounded-xl border text-sm animate-in fade-in slide-in-from-bottom-2",
                        feedback.isAccurate
                            ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400"
                    )}>
                        <div className="flex items-start gap-3">
                            {feedback.isAccurate ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                            )}
                            <div className="space-y-1">
                                <p className="font-bold">{feedback.isAccurate ? "Concept Mastered" : "Review Needed"}</p>
                                <p>{feedback.feedback}</p>
                                {feedback.socraticQuestion && (
                                    <p className="font-medium italic mt-2">"{feedback.socraticQuestion}"</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={!explanation.trim() || isEvaluating || (feedback?.isAccurate ?? false)}
                    className={cn(
                        "h-12 w-full font-bold uppercase tracking-widest shadow-lg transition-all",
                        feedback?.isAccurate
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-primary hover:bg-primary/90"
                    )}
                >
                    {isEvaluating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Evaluating...
                        </>
                    ) : feedback?.isAccurate ? (
                        <>
                            Proceeding... <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    ) : (
                        "Verify Understanding"
                    )}
                </Button>
            </div>
        </div>
    );
}
