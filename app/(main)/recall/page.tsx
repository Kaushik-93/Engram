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
    CheckCircle2,
    Loader2,
    MessageSquare,
    Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { bookStore, Book, highlightStore, Highlight, toFrontendHighlight, flashcardStore, recallStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type ViewState = "dashboard" | "session" | "summary";

export default function RecallPage() {
    const [view, setView] = React.useState<ViewState>("dashboard");
    const [books, setBooks] = React.useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
    const [highlights, setHighlights] = React.useState<any[]>([]);
    const [flashcards, setFlashcards] = React.useState<any[]>([]);
    const [questions, setQuestions] = React.useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [step, setStep] = React.useState<"prompt" | "review" | "loading">("prompt");
    const [userAnswer, setUserAnswer] = React.useState("");
    const [evaluation, setEvaluation] = React.useState<{ isCorrect: boolean; feedback: string; score: number } | null>(null);
    const [isEvaluating, setIsEvaluating] = React.useState(false);
    const [confidence, setConfidence] = React.useState<number>(50);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isGenerating, setIsGenerating] = React.useState(false);

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
            const [h, f] = await Promise.all([
                highlightStore.getByBook(book.id),
                flashcardStore.getByBook(book.id)
            ]);

            if (h.length === 0 && f.length === 0) {
                alert("This book has no context (highlights or flashcards) to generate recall sessions!");
                setIsLoading(false);
                return;
            }

            setHighlights(h);
            setFlashcards(f);
            setIsGenerating(true);
            setView("session");
            setStep("loading");

            const aiQuestions = await recallStore.generateQuestions(book.id, book.title, f, h);
            setQuestions(aiQuestions);
            setCurrentIndex(0);
            setStep("prompt");
        } catch (err) {
            console.error("Failed to start recall session:", err);
            alert("Failed to initialize session. Please try again.");
            setView("dashboard");
        } finally {
            setIsLoading(false);
            setIsGenerating(false);
        }
    }

    async function handleAnswerSubmit() {
        if (!userAnswer.trim() || isEvaluating) return;

        setIsEvaluating(true);
        try {
            const currentQ = questions[currentIndex];
            const result = await recallStore.evaluateAnswer(
                currentQ.question,
                currentQ.correctReference,
                userAnswer
            );
            setEvaluation(result);
            setStep("review");
        } catch (err) {
            console.error("Evaluation failed:", err);
        } finally {
            setIsEvaluating(false);
        }
    }

    const currentQuestion = questions[currentIndex];

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
        <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-3xl mx-auto px-6 py-12">
            {/* Header / Nav */}
            <div className="w-full flex items-center justify-between mb-16 px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full gap-2 text-muted-foreground hover:text-foreground h-10 px-4 transition-all"
                    onClick={() => setView("dashboard")}
                >
                    <ArrowLeft size={16} /> Dashboard
                </Button>

                <div className="flex flex-col items-center gap-2.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 translate-x-[0.1em]">Session Progress</span>
                    <div className="flex gap-2">
                        {(questions.length > 0 ? questions : [1, 2, 3, 4, 5]).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-700",
                                    i === currentIndex ? "bg-primary w-10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]" :
                                        i < currentIndex ? "bg-primary/40 w-4" : "bg-muted w-4"
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
                            {questions.length || 5}
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-700">
                {step === "loading" && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-8">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-[32px] bg-primary/10 flex items-center justify-center animate-pulse">
                                <Brain size={48} className="text-primary" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-black uppercase tracking-widest">Synthesizing Session</h2>
                            <p className="text-sm text-muted-foreground font-medium italic">Our AI is connecting your notes and cards into a custom recall path...</p>
                        </div>
                    </div>
                )}

                {step === "prompt" && currentQuestion && (
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
                                onClick={() => {
                                    if (currentIndex < questions.length - 1) {
                                        setCurrentIndex(prev => prev + 1);
                                        setUserAnswer("");
                                    } else {
                                        setView("dashboard");
                                    }
                                }}
                            >
                                Skip Concept
                            </Button>
                            <Button
                                size="lg"
                                className="px-10 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all gap-3"
                                onClick={handleAnswerSubmit}
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
                )}

                {step === "review" && evaluation && (
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
                                    onClick={() => {
                                        setStep("prompt");
                                        setEvaluation(null);
                                    }}
                                >
                                    <RefreshCw size={16} /> Re-Attempt Synthesis
                                </Button>
                                <Button
                                    className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-2xl shadow-primary/25 hover:scale-[1.05] active:scale-95 transition-all"
                                    onClick={() => {
                                        if (currentIndex < questions.length - 1) {
                                            setCurrentIndex(prev => prev + 1);
                                            setStep("prompt");
                                            setUserAnswer("");
                                            setEvaluation(null);
                                            setConfidence(50);
                                        } else {
                                            setView("dashboard");
                                        }
                                    }}
                                >
                                    Next Intelligence Path <ChevronRight size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
