"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Book, bookStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibraryToolbar, FilterStatus, SortOption } from "@/components/library/LibraryToolbar";
import { EmptyLibraryState } from "@/components/library/EmptyLibraryState";
import { BookGrid } from "@/components/library/BookGrid";

// Dynamic import to avoid SSR issues with react-pdf
const PdfViewer = dynamic(
    () => import("@/components/reader/PdfViewer").then((mod) => mod.PdfViewer),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center border-t border-border/40">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        </div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Initializing Workspace</div>
                </div>
            </div>
        )
    }
);

export default function LibraryPage() {
    const [books, setBooks] = React.useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortBy, setSortBy] = React.useState<SortOption>("recent");
    const [filterStatus, setFilterStatus] = React.useState<FilterStatus>("all");
    const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        loadBooks();
    }, []);

    async function loadBooks() {
        setIsLoading(true);
        try {
            const allBooks = await bookStore.getAll();
            setBooks(allBooks);
        } catch (err) {
            console.error("Failed to load books:", err);
            setError("Failed to load library. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || file.type !== "application/pdf") {
            setError("Please select a valid PDF file.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const reader = new FileReader();

            reader.onload = async () => {
                try {
                    const base64 = reader.result as string;
                    const newBook = await bookStore.add(
                        {
                            title: file.name.replace(".pdf", ""),
                            fileName: file.name,
                        },
                        base64,
                        () => { } // simplified progress for now
                    );
                    setBooks((prev) => [newBook, ...prev]);
                    setError(null);
                } catch (err) {
                    console.error("Failed to save PDF:", err);
                    setError("Failed to upload PDF. Please try again.");
                } finally {
                    setIsUploading(false);
                }
            };
            reader.onerror = () => {
                setError("Failed to read file.");
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Failed to upload PDF:", err);
            setError("Failed to upload PDF.");
            setIsUploading(false);
        }

        // Reset input logic handled by component ref usually, but we are passing handler
        e.target.value = "";
    }

    async function handleDeleteBook(book: Book) {
        if (confirm(`Delete "${book.title}"? This will also remove all highlights.`)) {
            try {
                await bookStore.delete(book.id);
                setBooks(books.filter((b) => b.id !== book.id));
            } catch (err) {
                console.error("Failed to delete book:", err);
                setError("Failed to delete book.");
            }
        }
    }

    async function handleToggleFavorite(book: Book) {
        // Optimistic update
        const newStatus = !book.is_favorite;
        setBooks(books.map(b => b.id === book.id ? { ...b, is_favorite: newStatus } : b));

        try {
            await bookStore.update(book.id, { is_favorite: newStatus });
        } catch (err) {
            console.error("Failed to update favorite status:", err);
            // Revert on failure
            setBooks(books.map(b => b.id === book.id ? { ...b, is_favorite: !newStatus } : b));
            setError("Failed to update favorite status.");
        }
    }

    const filteredBooks = React.useMemo(() => {
        return books
            .filter((book) => {
                const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());

                const progress = book.total_pages > 0 ? (book.last_read_page / book.total_pages) * 100 : 0;
                let matchesStatus = true;
                if (filterStatus === "favorites") matchesStatus = book.is_favorite;
                if (filterStatus === "new") matchesStatus = book.last_read_page === 0;
                if (filterStatus === "in-progress") matchesStatus = book.last_read_page > 0 && progress < 100;
                if (filterStatus === "completed") matchesStatus = progress === 100 && book.total_pages > 0;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === "recent") {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                if (sortBy === "title") {
                    return a.title.localeCompare(b.title);
                }
                if (sortBy === "progress") {
                    const progressA = a.total_pages > 0 ? a.last_read_page / a.total_pages : 0;
                    const progressB = b.total_pages > 0 ? b.last_read_page / b.total_pages : 0;
                    return progressB - progressA;
                }
                return 0;
            });
    }, [books, searchQuery, sortBy, filterStatus]);

    if (selectedBook) {
        return <PdfViewer book={selectedBook} onClose={() => setSelectedBook(null)} />;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
            <LibraryHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onUpload={handleFileUpload}
                isUploading={isUploading}
            />

            <LibraryToolbar
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl flex items-center gap-3 text-destructive animate-in slide-in-from-top-2">
                    <AlertCircle size={14} />
                    <p className="text-[10px] font-semibold">{error}</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 ml-auto hover:bg-destructive/10 text-destructive text-[9px]"
                        onClick={() => setError(null)}
                    >
                        Dismiss
                    </Button>
                </div>
            )}

            {filteredBooks.length > 0 || isLoading ? (
                <BookGrid
                    isLoading={isLoading}
                    books={filteredBooks}
                    onSelect={setSelectedBook}
                    onDelete={handleDeleteBook}
                    onToggleFavorite={handleToggleFavorite}
                />
            ) : (
                <EmptyLibraryState
                    searchQuery={searchQuery}
                    filterStatus={filterStatus}
                />
            )}
        </div>
    );
}
