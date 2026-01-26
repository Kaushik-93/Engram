"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Sparkles, ArrowRight, Wand2 } from "lucide-react";

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
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">

            {/* Header */}
            <div className="text-center space-y-2 mb-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-accent flex items-center justify-center mb-4 text-primary">
                    <User size={24} />
                </div>
                <h1 className="text-3xl font-bold">The Feynman Technique</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Identify gaps in your understanding by explaining the concept in simple terms, as if to a beginner.
                </p>
            </div>

            <Card className="border-0 glass premium-shadow sm:rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <CardHeader>
                    <CardTitle className="text-2xl">Concept: <span className="text-primary italic">Neuroplasticity</span></CardTitle>
                    <CardDescription className="text-lg">Target Audience: <span className="text-primary text-xl italic">A curious 12-year-old</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <textarea
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        className="w-full h-72 rounded-2xl border-0 bg-primary/5 p-8 text-xl placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-primary/10 resize-none leading-relaxed transition-all shadow-inner"
                        placeholder="Start explaining here. Imagine you are talking to a child who keeps asking 'why?'..."
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Word count: {explanation.split(" ").filter(w => w.length > 0).length}</span>
                        <Button onClick={handleAnalyze} disabled={!explanation || feedback === "analyzing"}>
                            {feedback === "analyzing" ? (
                                <>
                                    <Sparkles className="animate-spin mr-2" size={16} /> Analyzing...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2" size={16} /> Analyze Explanation
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback Section - Animated Reveal */}
            {feedback === "complete" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                        <Sparkles size={20} />
                        <span>Feedback</span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Clear Points</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm space-y-2 list-disc pl-4 text-foreground/80">
                                    <li>Good analogy using &quot;paths in a forest&quot;.</li>
                                    <li>Simple definition of neurons.</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Needs Simplification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm space-y-2 list-disc pl-4 text-foreground/80">
                                    <li>&quot;Synaptic pruning&quot; is jargon. Explain it simply (e.g., &quot;cleaning unused paths&quot;).</li>
                                    <li>The conclusion felt a bit rushed.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost">Save Draft</Button>
                        <Button className="gap-2">
                            Refine & Convert to Note <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
