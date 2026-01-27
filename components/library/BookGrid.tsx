"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCard } from "@/components/library/BookCard";
import { Book } from "@/lib/store";

interface BookGridProps {
    isLoading: boolean;
    books: Book[];
    onSelect: (book: Book) => void;
    onDelete: (book: Book) => void;
    onToggleFavorite: (book: Book) => void;
}

export function BookGrid({ isLoading, books, onSelect, onDelete, onToggleFavorite }: BookGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="rounded-[30px] border border-border/60 overflow-hidden h-48 bg-card/50">
                        <Skeleton className="h-20 w-full" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-2 w-1/2" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {books.map((book) => (
                <div key={book.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BookCard
                        book={book}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        onToggleFavorite={onToggleFavorite}
                    />
                </div>
            ))}
        </div>
    );
}
