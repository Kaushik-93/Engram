"use client";

import { Book } from "@/lib/store";
import { BookOpen, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface BookCardProps {
    book: Book;
    onSelect: (book: Book) => void;
    onDelete: (book: Book) => void;
}

export function BookCard({ book, onSelect, onDelete }: BookCardProps) {
    const progress = book.total_pages > 0
        ? Math.round((book.last_read_page / book.total_pages) * 100)
        : 0;

    return (
        <Card
            className="group relative p-0 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => onSelect(book)}
        >
            <CardContent className="p-6">
                {/* Delete Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(book);
                    }}
                    className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                >
                    <Trash2 size={14} />
                </Button>

                {/* Book Icon/Cover */}
                <div className="h-32 w-full rounded-lg bg-accent/30 flex items-center justify-center mb-6 group-hover:scale-[1.02] transition-transform">
                    <BookOpen className="text-primary/60 group-hover:text-primary transition-colors" size={48} />
                </div>

                {/* Title & Meta */}
                <div className="space-y-1">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {book.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.05em]">
                        {book.total_pages > 0 ? `${book.total_pages} pages` : "Processing..."}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground font-semibold">Progress</span>
                        <span className="text-primary font-bold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>
            </CardContent>
        </Card>
    );
}
