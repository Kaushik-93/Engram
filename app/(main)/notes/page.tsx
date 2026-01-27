"use client";

import * as React from "react";
import { bookStore, Book, highlightStore } from "@/lib/store";
import { NotesDashboard } from "@/components/notes/NotesDashboard";
import { NotesView } from "@/components/notes/NotesView";

type ViewState = "dashboard" | "book-notes";

export default function NotesPage() {
    const [view, setView] = React.useState<ViewState>("dashboard");
    const [books, setBooks] = React.useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
    const [highlights, setHighlights] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

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

    if (view === "dashboard") {
        return (
            <NotesDashboard
                books={books}
                isLoading={isLoading}
                onSelect={openBookNotes}
            />
        );
    }

    return (
        <NotesView
            book={selectedBook}
            highlights={highlights}
            isLoading={isLoading}
            onBack={() => setView("dashboard")}
        />
    );
}
