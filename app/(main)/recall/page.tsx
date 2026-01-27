"use client";

import * as React from "react";
import {
    Brain,
    Mic,
    ChevronRight,
    Eye,
    RefreshCw,
    ArrowLeft,
    Trophy,
    Clock,
    Target,
    BookOpen,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { bookStore, Book, highlightStore, Highlight, toFrontendHighlight } from "@/lib/store";
import { cn } from "@/lib/utils";

type ViewState = "dashboard" | "session" | "summary";

export default function RecallPage() {
    const [view, setView] = React.useState<ViewState>("dashboard");
    const [books, setBooks] = React.useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
    const [highlights, setHighlights] = React.useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [step, setStep] = React.useState<"prompt" | "review">("prompt");
    const [confidence, setConfidence] = React.useState<number>(50);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const allBooks = await bookStore.getAll();
            setBooks(allBooks);
        } catch (err) {
            console.error("Failed to load books:", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function startSession(book: Book) {
        setIsLoading(true);
        setSelectedBook(book);
        try {
            const h = await highlightStore.getByBook(book.id);
            const formatted = h.map(toFrontendHighlight);
            if (formatted.length > 0) {
                setHighlights(formatted);
                setCurrentIndex(0);
                setStep("prompt");
                setView("session");
            } else {
                alert("This book has no highlights to recall yet!");
            }
        } catch (err) {
            console.error("Failed to load highlights:", err);
        } finally {
            setIsLoading(false);
        }
    }

    const currentHighlight = highlights[currentIndex];

    // Dashboard View
    if (view === "dashboard") {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="relative p-8 rounded-[32px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 overflow-hidden shadow-2xl shadow-primary/5">
                    <div className="absolute top-0 right-0 p-8 text-primary/10">
                        <Brain size={160} strokeWidth={0.5} />
                    </div>
                    <div className="relative z-10 space-y-4 max-w-2xl">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs">
                            <Sparkles size={14} />
                            Neural Workspace
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                            Active <span className="text-primary italic">Recall</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                            Strengthen your neural pathways by retrieving information from memory. Select a subject to begin your practice session.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm">
                                <Trophy size={16} className="text-yellow-500" />
                                <span className="text-sm font-bold">7 Day Streak</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm">
                                <Target size={16} className="text-primary" />
                                <span className="text-sm font-bold">{books.length} Subjects</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subjects Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BookOpen size={20} className="text-primary" />
                            Your Subjects
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse border border-border/50" />
                            ))}
                        </div>
                    ) : books.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-[32px] border-2 border-dashed border-border/50">
                            <BookOpen className="mx-auto text-muted-foreground mb-4" size={40} />
                            <p className="text-muted-foreground font-medium">Add some books to your library to start recalling.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {books.map((book) => (
                                <Card
                                    key={book.id}
                                    className="group relative h-full rounded-[32px] border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                                    onClick={() => startSession(book)}
                                >
                                    <div className="absolute top-0 right-0 p-6 text-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <Brain size={80} />
                                    </div>
                                    <CardContent className="p-8 flex-1 flex flex-col gap-6">
                                        <div className="space-y-2">
                                            <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {book.title}
                                            </h3>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <Target size={12} />
                                                Subject Focus
                                            </p>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Concept Mastery</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-black">65%</span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <div key={i} className={cn("h-1.5 w-1.5 rounded-full", i <= 3 ? "bg-primary" : "bg-primary/20")} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button size="icon" className="rounded-2xl h-12 w-12 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                                    <ChevronRight />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Session View
    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] max-w-3xl mx-auto px-4">
            {/* Header / Nav */}
            <div className="w-full flex justify-between items-center mb-12">
                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setView("dashboard")}
                >
                    <ArrowLeft size={16} /> Dashboard
                </Button>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Session Progress</span>
                    <div className="flex gap-1.5">
                        {highlights.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 px-4 rounded-full transition-all duration-500",
                                    i === currentIndex ? "bg-primary w-8 shadow-[0_0_10px_rgba(var(--primary),0.5)]" :
                                        i < currentIndex ? "bg-primary/40" : "bg-muted w-4"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="w-24 text-right">
                    <span className="text-xs font-bold text-primary tabular-nums">
                        {currentIndex + 1} / {highlights.length}
                    </span>
                </div>
            </div>

            <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-700">
                {step === "prompt" && (
                    <div className="space-y-8">
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
                                <Sparkles size={12} />
                                Neural Retrieval
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-foreground max-w-2xl mx-auto">
                                {currentHighlight?.text || "Recall this concept from memory..."}
                            </h2>
                            <p className="text-lg text-muted-foreground font-medium italic opacity-60">"Your neural paths are forming..."</p>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-[40px] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <textarea
                                className="relative w-full h-64 rounded-[40px] border-border/40 bg-card/30 backdrop-blur-xl p-10 text-xl font-medium placeholder:text-muted-foreground/20 focus:ring-4 focus:ring-primary/10 focus:outline-none focus:border-primary/30 resize-none shadow-2xl transition-all"
                                placeholder="Detail your understanding..."
                                autoFocus
                            />
                            <div className="absolute bottom-6 right-6 flex gap-2">
                                <Button size="icon" variant="secondary" className="rounded-2xl shadow-lg" title="Voice Recall">
                                    <Mic size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-8">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-bold rounded-2xl h-12">
                                Skip Concept
                            </Button>
                            <Button
                                size="lg"
                                className="px-10 h-14 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                onClick={() => setStep("review")}
                            >
                                <Brain size={18} className="mr-2" /> Correct Analysis
                            </Button>
                        </div>
                    </div>
                )}

                {step === "review" && (
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Verification</h3>
                            <div className="p-10 rounded-[40px] bg-primary/5 border border-primary/10 shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 text-primary/5 transform -rotate-12">
                                    <CheckCircle2 size={120} />
                                </div>
                                <p className="text-xl font-medium leading-relaxed text-foreground relative z-10">
                                    {currentHighlight?.text}
                                </p>
                            </div>
                        </div>

                        <div className="pt-10 space-y-10 border-t border-border/50">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Recall Confidence</h4>
                                        <p className="text-xs text-muted-foreground font-medium">How accurately did you retrieve this?</p>
                                    </div>
                                    <span className="text-4xl font-black text-primary tabular-nums">{confidence}%</span>
                                </div>
                                <div className="px-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={confidence}
                                        onChange={(e) => setConfidence(parseInt(e.target.value))}
                                        className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                                    <span>Vague</span>
                                    <span>Crystal Clear</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="secondary"
                                    className="flex-1 h-16 rounded-2xl font-bold gap-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                                    onClick={() => {
                                        if (currentIndex < highlights.length - 1) {
                                            setCurrentIndex(prev => prev + 1);
                                            setStep("prompt");
                                            setConfidence(50);
                                        } else {
                                            setView("dashboard");
                                        }
                                    }}
                                >
                                    <RefreshCw size={18} /> Review Again
                                </Button>
                                <Button
                                    className="flex-[1.5] h-16 rounded-2xl font-black text-lg gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    onClick={() => {
                                        if (currentIndex < highlights.length - 1) {
                                            setCurrentIndex(prev => prev + 1);
                                            setStep("prompt");
                                            setConfidence(50);
                                        } else {
                                            setView("dashboard");
                                        }
                                    }}
                                >
                                    Next Concept <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
