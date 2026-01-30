"use client";

import * as React from "react";
import {
    Brain,
    Trophy,
    Target,
    BookOpen,
    Sparkles,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Book } from "@/lib/store";

interface RecallDashboardProps {
    books: Book[];
    isLoading: boolean;
    onStartSession: (book: Book) => void;
}

export function RecallDashboard({ books, isLoading, onStartSession }: RecallDashboardProps) {
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

            {/* Quick Actions */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <Card
                    className="group relative rounded-[32px] border border-border/60 bg-gradient-to-br from-orange-500/5 to-transparent hover:border-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500 cursor-pointer overflow-hidden"
                    onClick={() => window.location.href = "/recall/feed"}
                >
                    <div className="p-8 flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <Target size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">Daily Recall Feed</h3>
                            <p className="text-sm text-muted-foreground font-medium">Review your spaced repetition queue</p>
                        </div>
                        <Button size="icon" className="ml-auto rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors">
                            <ChevronRight />
                        </Button>
                    </div>
                </Card>

                <Card
                    className="group relative rounded-[32px] border border-border/60 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer overflow-hidden"
                    onClick={() => window.location.href = "/recall/brain-dump"}
                >
                    <div className="p-8 flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Brain size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">Brain Dump Canvas</h3>
                            <p className="text-sm text-muted-foreground font-medium">Force retrieval on a blank slate</p>
                        </div>
                        <Button size="icon" className="ml-auto rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors">
                            <ChevronRight />
                        </Button>
                    </div>
                </Card>
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
                                onClick={() => onStartSession(book)}
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
