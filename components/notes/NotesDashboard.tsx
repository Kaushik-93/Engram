"use client";

import * as React from "react";
import { Sparkles, FileText, Calendar, Highlighter, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "@/lib/store";

interface NotesDashboardProps {
    books: Book[];
    isLoading: boolean;
    onSelect: (book: Book) => void;
}

export function NotesDashboard({ books, isLoading, onSelect }: NotesDashboardProps) {
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                        <Sparkles size={12} />
                        Knowledge Base
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Your <span className="text-primary italic">Engrams</span></h1>
                    <p className="text-muted-foreground font-medium">Browse insights categorized by source material.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 rounded-[32px] bg-muted animate-pulse border border-border/50" />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-[32px] border-2 border-dashed border-border/50">
                    <FileText className="mx-auto text-muted-foreground mb-4" size={40} />
                    <p className="text-muted-foreground font-medium">No books in your library yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {books.map((book) => (
                        <Card
                            key={book.id}
                            className="group relative h-full rounded-[32px] border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden"
                            onClick={() => onSelect(book)}
                        >
                            <CardContent className="p-8 flex flex-col gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {book.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <Calendar size={12} />
                                        {new Date(book.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>

                                <div className="mt-auto flex justify-between items-center">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full text-primary">
                                        <Highlighter size={14} />
                                        <span className="text-xs font-bold">Review Notes</span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 group-hover:translate-x-1 transition-transform">
                                        <ChevronRight size={18} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
