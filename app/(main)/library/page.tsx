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
import { Card, CardContent } from "@/components/ui/card"; // Added Card import
import {
    BookOpen,
    Loader2,
    Search,
    Plus,
    AlertCircle,
    Clock,
    Heart,
    RefreshCw, // Added RefreshCw
    Activity, // Added Activity
    Sparkles, // Added Sparkles
    Calendar // Added Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

type SortOption = "recent" | "title" | "progress";
// Update FilterStatus type
type FilterStatus = "all" | "favorites" | "new" | "in-progress" | "completed";

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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                        <BookOpen size={12} />
                        Library Management
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Your <span className="text-primary italic">Collection</span></h1>
                    <p className="text-muted-foreground font-medium">Manage your digital engrams and search across your knowledge base.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" size={18} />
                        <input
                            type="text"
                            placeholder="Search your library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none text-sm font-medium"
                        />
                    </div>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-12 px-6 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2"
                    >
                        {isUploading ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={18} />}
                        Import PDF
                    </Button>
                </div>
            </div>

            {/* Filtering & Sorting Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-2 rounded-[24px] bg-muted/30 border border-border/40">
                <div className="flex p-1 bg-background/50 rounded-2xl border border-border/40 gap-1 overflow-x-auto no-scrollbar">
                    {(["all", "favorites", "new", "in-progress", "completed"] as FilterStatus[]).map((status) => (
                        <TooltipProvider key={status}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={filterStatus === status ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setFilterStatus(status)}
                                        className={cn(
                                            "rounded-xl px-4 py-1.5 h-9 text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                                            filterStatus === status ? "bg-card shadow-sm text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {status === "favorites" ? <Heart size={14} className={cn(filterStatus === status && "fill-primary")} /> : status.replace("-", " ")}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold uppercase text-[10px] tracking-widest">Filter: {status}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>

                <div className="flex items-center gap-2 pr-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2 shrink-0">Sort by</span>
                    <div className="flex p-1 bg-background/50 rounded-2xl border border-border/40 gap-1">
                        {(["recent", "title", "progress"] as SortOption[]).map((option) => (
                            <TooltipProvider key={option}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={sortBy === option ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setSortBy(option)}
                                            className={cn(
                                                "rounded-xl p-1 h-9 w-9 transition-all",
                                                sortBy === option ? "bg-card shadow-sm text-primary" : "text-muted-foreground"
                                            )}
                                        >
                                            {option === "recent" && <Clock size={16} />}
                                            {option === "title" && <span className="font-black text-[10px] uppercase">Az</span>}
                                            {option === "progress" && <Activity size={16} />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold uppercase text-[10px] tracking-widest">Sort: {option}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
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

            {/* Content Area */}
            {isLoading ? (
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
            ) : filteredBooks.length === 0 ? (
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
            ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <BookCard
                                book={book}
                                onSelect={setSelectedBook}
                                onDelete={handleDeleteBook}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
