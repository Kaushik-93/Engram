"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";
import { FilterStatus } from "./LibraryToolbar";

interface EmptyLibraryStateProps {
    searchQuery: string;
    filterStatus: FilterStatus;
}

export function EmptyLibraryState({ searchQuery, filterStatus }: EmptyLibraryStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-6 bg-muted/10 rounded-[40px] border-2 border-dashed border-border/40">
            <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center shadow-lg border border-border/50">
                <BookOpen className="text-primary/30" size={24} />
            </div>
            <div className="text-center space-y-2 max-w-xs mx-auto">
                <h2 className="text-lg font-black text-foreground">
                    {searchQuery || filterStatus !== 'all' ? "No books found" : "Your library is empty"}
                </h2>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                    {filterStatus === 'favorites'
                        ? "You haven't added any books to favorites yet."
                        : searchQuery
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Start your journey by uploading your first PDF document to build your knowledge base."}
                </p>
            </div>
        </div>
    );
}
