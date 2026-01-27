"use client";

import * as React from "react";
import {
    Search,
    Plus,
    BookOpen,
    ChevronRight,
    ArrowLeft,
    Search as SearchIcon,
    Copy,
    Share2,
    MoreHorizontal,
    Highlighter,
    FileText,
    Calendar,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bookStore, Book, highlightStore, Highlight } from "@/lib/store";
import { cn } from "@/lib/utils";

type ViewState = "dashboard" | "book-notes";

export default function NotesPage() {
    const [view, setView] = React.useState<ViewState>("dashboard");
    const [books, setBooks] = React.useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
    const [highlights, setHighlights] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");

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

    async function openBookNotes(book: Book) {
        setIsLoading(true);
        setSelectedBook(book);
        try {
            const h = await highlightStore.getByBook(book.id);
            setHighlights(h);
            setView("book-notes");
        } catch (err) {
            console.error("Failed to load highlights:", err);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredHighlights = highlights.filter(h =>
        h.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dashboard View
    if (view === "dashboard") {
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
                                onClick={() => openBookNotes(book)}
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

    // Book specific notes view
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header / Nav */}
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit rounded-full gap-2 text-muted-foreground hover:text-foreground -ml-2"
                    onClick={() => setView("dashboard")}
                >
                    <ArrowLeft size={16} /> Dashboard
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                            <FileText size={12} />
                            Source Material
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-tight">{selectedBook?.title}</h2>
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
