"use client";

import * as React from "react";
import { Sparkles, Mic, Loader2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionPromptProps {
    currentQuestion: any;
    userAnswer: string;
    isEvaluating: boolean;
    setUserAnswer: (answer: string) => void;
    onSkip: () => void;
    onSubmit: () => void;
}

export function SessionPrompt({
    currentQuestion,
    userAnswer,
    isEvaluating,
    setUserAnswer,
    onSkip,
    onSubmit
}: SessionPromptProps) {
    if (!currentQuestion) return null;

    return (
        <div className="w-full space-y-10">
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-[9px] font-black text-primary uppercase tracking-[0.25em] border border-primary/10">
                    <Sparkles size={12} className="animate-pulse" />
                    Reinforced Learning: {currentQuestion.type}
                </div>
                <h2 className="text-3xl md:text-4xl font-black leading-[1.2] tracking-tight text-foreground max-w-[90%] mx-auto">
                    {currentQuestion.question}
                </h2>
                <p className="text-base text-muted-foreground font-medium italic opacity-60 max-w-xl mx-auto">
                    Hint: {currentQuestion.hint}
                </p>
            </div>

            <div className="relative group max-w-2xl mx-auto w-full">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[48px] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative">
                    <textarea
                        className="w-full h-64 rounded-[40px] border-border/40 bg-card/40 backdrop-blur-xl p-10 text-xl font-medium placeholder:text-muted-foreground/10 focus:ring-4 focus:ring-primary/10 focus:outline-none focus:border-primary/30 resize-none shadow-2xl transition-all scrollbar-none"
                        placeholder="Explain your answer in detail..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        autoFocus
                    />
                    <div className="absolute bottom-8 right-8">
                        <Button size="icon" variant="ghost" className="rounded-2xl h-12 w-12 bg-muted/30 hover:bg-muted/50 border border-border/20 text-muted-foreground hover:text-primary transition-all" title="Voice Recall">
                            <Mic size={20} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-8 max-w-2xl mx-auto w-full">
                <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl h-12 px-6 transition-all"
                    onClick={onSkip}
                >
                    Skip Concept
                </Button>
                <Button
                    size="lg"
                    className="px-10 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all gap-3"
                    onClick={onSubmit}
                    disabled={isEvaluating || !userAnswer.trim()}
                >
                    {isEvaluating ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                        <><Brain size={18} /> Submit Analysis</>
                    )}
                </Button>
            </div>
        </div>
    );
}
