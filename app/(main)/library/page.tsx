"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Book, bookStore } from "@/lib/store";
import { BookCard } from "@/components/library/BookCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Upload,
    BookOpen,
    Loader2,
    Search,
    Filter,
    LayoutGrid,
    ArrowUpDown,
    Plus,
    AlertCircle,
    CheckCircle2,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamic import to avoid SSR issues with react-pdf
const PdfViewer = dynamic(
    () => import("@/components/reader/PdfViewer").then((mod) => mod.PdfViewer),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <div className="text-muted-foreground font-medium animate-pulse">Initializing Library...</div>
                </div>
            </div>
        )
    }
);

type SortOption = "recent" | "title" | "progress";
type FilterStatus = "all" | "new" | "in-progress" | "completed";

export default function LibraryPage() {
    const [books, setBooks] = React.useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortBy, setSortBy] = React.useState<SortOption>("recent");
    const [filterStatus, setFilterStatus] = React.useState<FilterStatus>("all");
    const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 10);
                    setUploadProgress(progress);
                }
            };

            reader.onload = async () => {
                try {
                    const base64 = reader.result as string;
                    const newBook = await bookStore.add(
                        {
                            title: file.name.replace(".pdf", ""),
                            fileName: file.name,
                        },
                        base64,
                        (progress) => {
                            setUploadProgress(10 + Math.round(progress * 0.9));
                        }
                    );
                    setBooks((prev) => [newBook, ...prev]);
                    setError(null);
                } catch (err) {
                    console.error("Failed to save PDF:", err);
                    setError("Failed to upload PDF. Please try again.");
                } finally {
                    setIsUploading(false);
                    setUploadProgress(0);
                }
            };
            reader.onerror = () => {
                setError("Failed to read file.");
                setIsUploading(false);
                setUploadProgress(0);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Failed to upload PDF:", err);
            setError("Failed to upload PDF.");
            setIsUploading(false);
            setUploadProgress(0);
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
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

    const filteredBooks = React.useMemo(() => {
        return books
            .filter((book) => {
                const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());

                const progress = book.total_pages > 0 ? (book.last_read_page / book.total_pages) * 100 : 0;
                let matchesStatus = true;
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
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Controls Bar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-md py-4 border-b border-border/40 px-2 lg:px-0">
                <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="relative group min-w-[240px] flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search your library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 bg-card border-border/60 rounded-xl focus-visible:ring-primary/20 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/50 h-10">
                        {[
                            { id: 'all', icon: LayoutGrid },
                            { id: 'new', icon: Plus },
                            { id: 'in-progress', icon: Clock },
                            { id: 'completed', icon: CheckCircle2 },
                        ].map((s) => (
                            <Button
                                key={s.id}
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setFilterStatus(s.id as FilterStatus)}
                                className={cn(
                                    "h-8 w-8 transition-all",
                                    filterStatus === s.id
                                        ? "bg-background text-primary shadow-xs"
                                        : "text-muted-foreground hover:bg-background/50"
                                )}
                                title={`Filter: ${s.id}`}
                            >
                                <s.icon size={15} />
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/50 h-10">
                        {[
                            { id: 'recent', label: 'Recent', icon: ArrowUpDown },
                            { id: 'title', label: 'A-Z', icon: Filter },
                            { id: 'progress', label: 'Progress', icon: LayoutGrid },
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSortBy(option.id as SortOption)}
                                className={cn(
                                    "flex items-center gap-2 px-3 h-8 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap",
                                    sortBy === option.id
                                        ? "bg-background text-primary shadow-xs"
                                        : "text-muted-foreground hover:bg-background/50"
                                )}
                            >
                                <option.icon size={11} />
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <Separator orientation="vertical" className="h-5 mx-1 hidden sm:block" />

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        size="sm"
                        className="h-10 px-4 bg-primary text-primary-foreground font-bold shadow-sm"
                    >
                        {isUploading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Plus size={14} strokeWidth={3} />
                        )}
                        <span className="hidden sm:inline text-xs">Add PDF</span>
                    </Button>
                </div>
            </div>

            {/* Error Message */}
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

            {/* Library Grid */}
            {isLoading ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-fr">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="flex flex-col h-full space-y-3 bg-card p-0 rounded-xl border border-border overflow-hidden">
                            <Skeleton className="h-20 w-full" />
                            <div className="px-3.5 py-1.5 space-y-2">
                                <Skeleton className="h-3 w-3/4" />
                                <Skeleton className="h-2 w-1/2" />
                            </div>
                            <div className="mt-auto p-3 border-t border-border/50">
                                <Skeleton className="h-1.5 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40">
                    <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center shadow-lg border border-border/50">
                        <BookOpen className="text-primary/30" size={24} />
                    </div>
                    <div className="text-center space-y-2 max-w-xs">
                        <h2 className="text-base font-black text-foreground">
                            {searchQuery || filterStatus !== 'all' ? "No results found" : "Your library is empty"}
                        </h2>
                        <p className="text-[10px] text-muted-foreground font-medium">
                            {searchQuery
                                ? "Try adjusting your search or filters."
                                : "Start your journey by uploading your first PDF document."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-fr">
                    {filteredBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            onSelect={setSelectedBook}
                            onDelete={handleDeleteBook}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
