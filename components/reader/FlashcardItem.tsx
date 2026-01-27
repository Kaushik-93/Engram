"use client";

import * as React from "react";
import { Flashcard, flashcardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, RotateCw, CheckCircle2, XCircle, Brain, GalleryVerticalEnd, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardItemProps {
    card: Flashcard;
    index: number;
    onDelete: (id: string) => void;
}

export function FlashcardItem({ card, index, onDelete }: FlashcardItemProps) {
    const [mode, setMode] = React.useState<"review" | "quiz">("review");
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [userAnswer, setUserAnswer] = React.useState("");
    const [evaluation, setEvaluation] = React.useState<{ isCorrect: boolean; feedback: string; score: number } | null>(null);
    const [isEvaluating, setIsEvaluating] = React.useState(false);

    async function handleSubmit() {
        if (!userAnswer.trim()) return;
        setIsEvaluating(true);
        try {
            const response = await fetch("/api/ai/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: card.front,
                    correctAnswer: card.back,
                    userAnswer: userAnswer
                })
            });
            const data = await response.json();
            setEvaluation(data);
        } catch (error) {
            console.error("Failed to evaluate:", error);
        } finally {
            setIsEvaluating(false);
        }
    }

    function resetQuiz() {
        setMode("review");
        setUserAnswer("");
        setEvaluation(null);
        setIsFlipped(false);
    }

    return (
        <div className="group perspective-1000">
            <div className={cn(
                "relative bg-card border border-border/60 rounded-[28px] p-6 shadow-lg transition-all duration-500",
                mode === "quiz" ? "border-primary/50 shadow-primary/10" : "hover:border-primary/40 hover:shadow-primary/5"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] bg-secondary/10 px-3 py-1 rounded-full border border-secondary/10">
                        Card {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                        {mode === "review" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMode("quiz")}
                                className="h-6 text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-lg px-2"
                            >
                                Test Neural Recall
                            </Button>
                        )}
                        {mode === "review" && (
                            <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
                                <Trash2 size={14} onClick={() => onDelete(card.id)} />
                            </Button>
                        )}
                        {mode === "quiz" && (
                            <Button variant="ghost" size="icon-xs" onClick={resetQuiz} className="rounded-xl hover:bg-muted text-muted-foreground">
                                <RotateCw size={14} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* Front / Question */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Brain size={12} /> Question
                        </p>
                        <p className="text-sm font-bold text-foreground leading-relaxed">{card.front}</p>
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Review Mode: Back / Answer */}
                    {mode === "review" && (
                        <div className="space-y-2 relative">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <GalleryVerticalEnd size={12} /> Answer
                            </p>
                            <div
                                onClick={() => setIsFlipped(!isFlipped)}
                                className={cn(
                                    "text-sm text-foreground/90 leading-relaxed p-3 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:bg-muted/50",
                                    !isFlipped && "blur-sm select-none"
                                )}
                            >
                                {card.back}
                            </div>
                            {!isFlipped && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none top-6">
                                    <span className="bg-background/80 backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm">
                                        Click to Reveal
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quiz Mode */}
                    {mode === "quiz" && !evaluation && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Your Answer</p>
                                <Input
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Type your answer..."
                                    className="bg-background/50 border-border/60 focus-visible:ring-primary/20"
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                />
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={isEvaluating || !userAnswer}
                                className="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[10px] h-9 rounded-xl"
                            >
                                {isEvaluating ? <Loader2 className="animate-spin mr-2" size={14} /> : "Check Answer"}
                            </Button>
                        </div>
                    )}

                    {/* Evaluation Result */}
                    {mode === "quiz" && evaluation && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                            <div className={cn(
                                "p-4 rounded-2xl border flex flex-col gap-2",
                                evaluation.isCorrect ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
                            )}>
                                <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                                    {evaluation.isCorrect ? (
                                        <><CheckCircle2 size={14} className="text-green-600" /> <span className="text-green-700">Correct ({evaluation.score}/10)</span></>
                                    ) : (
                                        <><XCircle size={14} className="text-red-600" /> <span className="text-red-700">Incorrect ({evaluation.score}/10)</span></>
                                    )}
                                </div>
                                <p className="text-xs font-medium leading-relaxed opacity-90">
                                    {evaluation.feedback}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Correct Answer</p>
                                <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-2 rounded-lg">{card.back}</p>
                            </div>

                            <Button onClick={resetQuiz} variant="secondary" className="w-full h-9 rounded-xl font-black uppercase tracking-widest text-[10px]">
                                Continue Review
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
