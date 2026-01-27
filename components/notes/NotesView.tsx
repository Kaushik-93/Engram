"use client";

import * as React from "react";
import {
    ArrowLeft,
    FileText,
    Highlighter,
    Search as SearchIcon,
    Copy,
    Share2,
    MoreHorizontal,
    BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Book, FrontendHighlight } from "@/lib/store";

interface NotesViewProps {
    book: Book | null;
    highlights: FrontendHighlight[];
    isLoading: boolean;
    onBack: () => void;
}

export function NotesView({ book, highlights, isLoading, onBack }: NotesViewProps) {
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredHighlights = React.useMemo(() => {
        return highlights.filter(h =>
            h.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [highlights, searchQuery]);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header / Nav */}
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit rounded-full gap-2 text-muted-foreground hover:text-foreground -ml-2"
                    onClick={onBack}
                >
                    <ArrowLeft size={16} /> Dashboard
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                            <FileText size={12} />
                            Source Material
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-tight">{book?.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                                <Highlighter size={14} className="text-primary" />
                                {highlights.length} Highlights
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>v1.0</span>
                        </div>
                    </div>

                    <div className="relative w-full md:w-72">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                        <input
                            type="text"
                            placeholder="Filter insights..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Notes List */}
            <div className="space-y-6">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-32 rounded-[32px] bg-muted animate-pulse" />
                    ))
                ) : filteredHighlights.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-[40px] border-2 border-dashed border-border/50">
                        <p className="text-muted-foreground font-medium">No insights match your filter.</p>
                    </div>
                ) : (
                    filteredHighlights.map((highlight, index) => (
                        <Card
                            key={highlight.id}
                            className="group rounded-[32px] border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:shadow-xl transition-all duration-500 overflow-hidden"
                        >
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-primary italic">#{index + 1}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg cursor-pointer">
                                            <Copy size={14} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg cursor-pointer">
                                            <Share2 size={14} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg cursor-pointer">
                                            <MoreHorizontal size={14} />
                                        </Button>
                                    </div>
                                </div>

                                <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/90 selection:bg-primary/20">
                                    {highlight.text}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                        <BookOpen size={12} className="text-primary" />
                                        Page {highlight.pageNumber}
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-primary/5 text-[10px] font-black text-primary uppercase tracking-widest">
                                        Insight
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
