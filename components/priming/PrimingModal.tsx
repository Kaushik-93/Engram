"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, BrainCircuit, ArrowRight, Lightbulb, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Book } from "@/lib/store";

interface PrimingModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
}

type Step = "input" | "generating" | "results";

interface PrimingContent {
    guidingQuestions: string[];
    curiosityHook: string;
    keyConcepts: string[];
    examStyle: string;
}

export function PrimingModal({ book, isOpen, onClose }: PrimingModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>("input");
    const [knowledgeInput, setKnowledgeInput] = useState("");
    const [content, setContent] = useState<PrimingContent | null>(null);

    const handleStart = async () => {
        if (!book) return;
        setStep("generating");

        try {
            // Save prediction if input exists
            if (knowledgeInput.trim()) {
                // TODO: Save to Supabase 'user_predictions'
                // await savePrediction(book.id, knowledgeInput);
            }

            // Generate content
            const response = await fetch("/api/ai/priming", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: book.title,
                    context: `User prior knowledge: ${knowledgeInput}` // Pass user input as context
                }),
            });

            if (!response.ok) throw new Error("Failed to generate");

            const data = await response.json();
            setContent(data);
            setStep("results");
        } catch (error) {
            console.error(error);
            // Fallback: just go to reader if AI fails
            router.push(`/reader/${book.id}`);
            onClose();
        }
    };

    const handleGoToReader = () => {
        if (book) {
            router.push(`/reader/${book.id}`);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-3xl border-border/50 shadow-2xl duration-500">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BrainCircuit className="text-primary h-6 w-6" />
                        Context Engine
                    </DialogTitle>
                    <DialogDescription>
                        Priming your brain for "{book?.title}"
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 min-h-[300px] flex flex-col">
                    {step === "input" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/80">
                                    What do you already know about this topic?
                                </label>
                                <p className="text-xs text-muted-foreground">
                                    Making a prediction now—even if wrong—boosts retention by 20-30%.
                                </p>
                                <Textarea
                                    value={knowledgeInput}
                                    onChange={(e) => setKnowledgeInput(e.target.value)}
                                    placeholder="I think it's about..."
                                    className="min-h-[120px] bg-background/50 border-primary/20 focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>
                            <Button
                                onClick={handleStart}
                                className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group"
                            >
                                <Sparkles className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Ignite Context
                            </Button>
                        </div>
                    )}

                    {step === "generating" && (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                            </div>
                            <p className="text-lg font-medium text-muted-foreground animate-pulse">
                                Analyzing concept graph...
                            </p>
                        </div>
                    )}

                    {step === "results" && content && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

                            {/* Hook */}
                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                                <h4 className="flex items-center gap-2 font-bold mb-1 text-xs uppercase tracking-widest">
                                    <Lightbulb className="h-4 w-4" /> Curiosity Hook
                                </h4>
                                <p className="text-sm font-medium italic">"{content.curiosityHook}"</p>
                            </div>

                            {/* Questions */}
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                    <HelpCircle className="h-4 w-4" /> Guiding Questions
                                </h4>
                                <div className="grid gap-3">
                                    {content.guidingQuestions.map((q, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-background/50 border border-border text-sm">
                                            {q}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Concepts Tags */}
                            {content.keyConcepts && (
                                <div className="flex flex-wrap gap-2">
                                    {content.keyConcepts.map((c, i) => (
                                        <span key={i} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <Button
                                onClick={handleGoToReader}
                                className="w-full h-12 text-lg font-bold bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 group"
                            >
                                Start Active Reading
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
