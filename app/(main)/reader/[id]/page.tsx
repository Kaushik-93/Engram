"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Book, bookStore } from "@/lib/store";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamic import for PdfViewer to avoid SSR issues
const PdfViewer = dynamic(
    () => import("@/components/reader/PdfViewer").then((mod) => mod.PdfViewer),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }
);

export default function ReaderPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function fetchBook() {
            setLoading(true);
            try {
                const fetchedBook = await bookStore.get(id);
                if (fetchedBook) {
                    setBook(fetchedBook);
                } else {
                    setError("Book not found");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load book");
            } finally {
                setLoading(false);
            }
        }

        fetchBook();
    }, [id]);

    const handleClose = () => {
        router.push("/library");
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-muted-foreground">{error || "Book not found"}</p>
                <Button onClick={handleClose}>Return to Library</Button>
            </div>
        );
    }

    return <PdfViewer book={book} onClose={handleClose} />;
}
