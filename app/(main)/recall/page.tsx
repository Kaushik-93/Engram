"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Mic, ChevronRight, Eye, RefreshCw } from "lucide-react";

export default function RecallPage() {
    const [step, setStep] = React.useState<"prompt" | "review">("prompt");
    const [confidence, setConfidence] = React.useState<number>(50);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-2xl mx-auto">

            {/* Session Progress Header */}
            <div className="w-full flex justify-between items-center mb-12 text-muted-foreground text-sm">
                <span>Card 2 of 5</span>
                <div className="flex gap-1">
                    <div className="h-1.5 w-8 rounded-full bg-primary" />
                    <div className="h-1.5 w-8 rounded-full bg-primary" />
                    <div className="h-1.5 w-8 rounded-full bg-primary/20" />
                    <div className="h-1.5 w-8 rounded-full bg-primary/20" />
                    <div className="h-1.5 w-8 rounded-full bg-primary/20" />
                </div>
                <span>Active Session</span>
            </div>

            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">

                {/* Step 1: Prompt & Recall */}
                {step === "prompt" && (
                    <div className="space-y-6">
                        <div className="text-center space-y-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
                                Knowledge Retrieval
                            </span>
                            <h1 className="text-4xl font-bold leading-tight tracking-tight">
                                What is the difference between <br />
                                <span className="text-primary italic">Intrinsic</span> and <span className="text-primary italic">Extraneous</span> load?
                            </h1>
                            <p className="text-2xl text-primary/60 italic animate-pulse">"Don't worry about being perfect, just be honest."</p>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <textarea
                                className="relative w-full h-56 rounded-3xl border-0 glass p-8 text-xl placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none shadow-xl transition-all"
                                placeholder="Explain it in your own words..."
                                autoFocus
                            />
                            <button className="absolute bottom-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors" title="Use Voice Input">
                                <Mic size={20} />
                            </button>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                I don&apos;t know
                            </Button>
                            <Button size="lg" className="px-8" onClick={() => setStep("review")}>
                                Submit Recall
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Review & Grading */}
                {step === "review" && (
                    <div className="space-y-8">
                        <Card className="bg-muted/30 border-dashed">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Your Answer</h3>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setStep("prompt")}>Edit</Button>
                                </div>
                                <p className="text-lg">
                                    Intrinsic load is about the difficulty of the subject itself, while extraneous load is about how it&apos;s presented.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Reference Answer</h3>
                                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                    <Eye size={14} /> Full Context
                                </Button>
                            </div>
                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                                <p className="text-lg leading-relaxed">
                                    <span className="font-bold text-primary">Intrinsic load</span> refers to the inherent complexity of the material and effective working memory resources required.
                                    <br /><br />
                                    <span className="font-bold text-primary">Extraneous load</span> is generated by the manner in which information is presented to learners and is under the control of instructional designers.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 space-y-6 border-t">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>How confident did you feel?</span>
                                    <span className="text-primary">{confidence}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={confidence}
                                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button variant="secondary" className="flex-1 gap-2">
                                    <RefreshCw size={16} /> Needs Practice
                                </Button>
                                <Button className="flex-[2] gap-2">
                                    Continue <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
