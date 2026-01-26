"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Book, bookStore } from "@/lib/store";
import { BookCard } from "@/components/library/BookCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, BookOpen, Loader2 } from "lucide-react";

// Dynamic import to avoid SSR issues with react-pdf
const PdfViewer = dynamic(
    () => import("@/components/reader/PdfViewer").then((mod) => mod.PdfViewer),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading PDF Reader...</div>
            </div>
        )
    }
);

export default function ReadPage() {
    const [books, setBooks] = React.useState<Book[]>([]);
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

            // Track file reading progress
            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 10); // First 10% is reading
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
                            // Map 0-100% upload progress to 10-100% total progress
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

    // Show PDF Viewer if a book is selected
    if (selectedBook) {
        return <PdfViewer book={selectedBook} onClose={() => setSelectedBook(null)} />;
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col space-y-8 md:flex-row md:items-end md:justify-between md:space-y-0 pb-8 border-b border-border">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                        Your <span className="text-primary">Library</span>
                    </h1>
                    <p className="text-muted-foreground text-base">
                        Cloud-synced knowledge, compressed for efficiency.
                    </p>
                </div>

                <div className="flex gap-4 items-center">
                    {error && (
                        <span className="text-sm text-destructive">{error}</span>
                    )}
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
                        className="h-12 px-6 rounded-xl btn-shadow font-medium text-sm gap-2 relative overflow-hidden"
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center justify-center w-full min-w-[140px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span className="text-xs">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-1 w-24 bg-muted" />
                            </div>
                        ) : (
                            <>
                                <Upload size={18} />
                                Upload PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Library Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="text-primary animate-spin" size={32} />
                </div>
            ) : books.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                    <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center">
                        <BookOpen className="text-muted-foreground" size={40} />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-muted-foreground">No books yet</h2>
                        <p className="text-sm text-muted-foreground/60">
                            Upload a PDF to start building your library.
                        </p>
                    </div>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="secondary"
                        className="gap-2"
                    >
                        <Upload size={16} /> Upload your first PDF
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {books.map((book) => (
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
