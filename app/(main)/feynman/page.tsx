"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Sparkles, ArrowRight, Wand2, Brain, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeynmanPage() {
    const [explanation, setExplanation] = React.useState("");
    const [feedback, setFeedback] = React.useState<null | "analyzing" | "complete">(null);

    const handleAnalyze = () => {
        setFeedback("analyzing");
        setTimeout(() => {
            setFeedback("complete");
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative p-10 rounded-[40px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute top-0 right-0 p-10 text-primary/10">
                    <Brain size={120} strokeWidth={0.5} />
                </div>
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                        <Zap size={14} />
                        Interactive Sandbox
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                        The Feynman <span className="text-primary italic">Technique</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                        Identify gaps in your understanding by explaining complex concepts in simple terms. If you can&apos;t explain it to a beginner, you don&apos;t understand it.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-start">
                {/* Input Section */}
                <div className="lg:col-span-12">
                    <Card className="rounded-[32px] border border-border/60 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                                        <Target size={12} />
                                        Current Concept
                                    </div>
                                    <CardTitle className="text-2xl font-black">Neuroplasticity</CardTitle>
                                </div>
                                <div className="px-4 py-1.5 rounded-full bg-primary/5 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10">
                                    Audience: 12-Year Old
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 space-y-6">
                            <textarea
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                className="w-full h-80 rounded-[24px] border border-border/40 bg-background/50 p-8 text-xl placeholder:text-muted-foreground/20 focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none resize-none leading-relaxed transition-all shadow-inner font-medium"
                                placeholder="Start explaining here. Imagine you are talking to a child who keeps asking 'why?'..."
                            />
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Word count: <span className="text-primary">{explanation.split(/\s+/).filter(w => w.length > 0).length}</span>
                                    </div>
                                    <div className="w-px h-3 bg-border" />
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Reading Grade: <span className="text-primary">6th</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!explanation || feedback === "analyzing"}
                                    className="h-12 px-6 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all gap-2"
                                >
                                    {feedback === "analyzing" ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={16} /> Analyzing explanation...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={16} /> Analyze Explanation
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Feedback Section - Animated Reveal */}
                {feedback === "complete" && (
                    <div className="lg:col-span-12 space-y-6 animate-in slide-in-from-bottom-6 fade-in duration-700">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px] px-2 mt-4">
                            <Sparkles size={14} />
                            Study Feedback
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="rounded-[32px] border-green-500/20 bg-green-500/5 backdrop-blur-sm overflow-hidden p-8 space-y-4">
                                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                                    <Sparkles size={20} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-black text-lg text-green-700 dark:text-green-400">Conceptual Clarity</h3>
                                    <ul className="text-sm space-y-3 font-medium text-foreground/80">
                                        <li className="flex items-start gap-2 italic">&quot;Good analogy using &apos;paths in a forest&apos; - it makes the complex simple.&quot;</li>
                                        <li className="flex items-start gap-2 italic">&quot;Strong opening - you immediately identified the core mechanism.&quot;</li>
                                    </ul>
                                </div>
                            </Card>

                            <Card className="rounded-[32px] border-amber-500/20 bg-amber-500/5 backdrop-blur-sm overflow-hidden p-8 space-y-4">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <Zap size={20} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-black text-lg text-amber-700 dark:text-amber-400">Simplification Zones</h3>
                                    <ul className="text-sm space-y-3 font-medium text-foreground/80">
                                        <li className="flex items-start gap-2 italic">&quot;The term &apos;Synaptic Pruning&apos; is too technical. Try &apos;cleaning unused paths&apos;.&quot;</li>
                                        <li className="flex items-start gap-2 italic">&quot;The pacing in the second paragraph is a bit fast for a beginner.&quot;</li>
                                    </ul>
                                </div>
                            </Card>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" className="rounded-xl font-bold text-muted-foreground hover:text-foreground">Save Draft</Button>
                            <Button className="h-12 px-6 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 gap-2">
                                Save Concept <ArrowRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Fixed missing import for RefreshCw
import { RefreshCw } from "lucide-react";

