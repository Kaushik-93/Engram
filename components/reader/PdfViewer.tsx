"use client";

import * as React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Book, highlightStore, bookStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Highlighter, Download } from "lucide-react";
import { cn } from "@/lib/utils";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Frontend highlight type (from store's toFrontendHighlight)
interface FrontendHighlight {
    id: string;
    bookId: string;
    text: string;
    pageNumber: number;
    position: { x: number; y: number; width: number; height: number };
    color: string;
    createdAt: string;
}

interface PdfViewerProps {
    book: Book;
    onClose: () => void;
}

export function PdfViewer({ book, onClose }: PdfViewerProps) {
    const [fileData, setFileData] = React.useState<string | null>(null);
    const [numPages, setNumPages] = React.useState<number>(0);
    const [pageNumber, setPageNumber] = React.useState<number>(book.last_read_page || 1);
    const [scale, setScale] = React.useState<number>(1.2);
    const [highlights, setHighlights] = React.useState<FrontendHighlight[]>([]);
    const [isHighlighting, setIsHighlighting] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Load file data and highlights on mount
    React.useEffect(() => {
        async function load() {
            setIsLoading(true);
            try {
                const data = await bookStore.getFileData(book.id);
                if (data) setFileData(data);
                const h = await highlightStore.getByBook(book.id);
                setHighlights(h);
            } catch (err) {
                console.error("Failed to load PDF:", err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [book.id]);

    // Save reading progress
    React.useEffect(() => {
        if (numPages > 0) {
            bookStore.update(book.id, { last_read_page: pageNumber, total_pages: numPages });
        }
    }, [pageNumber, numPages, book.id]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    async function handleTextSelection() {
        if (!isHighlighting) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const text = selection.toString().trim();
        if (!text) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (containerRect) {
            try {
                const highlight = await highlightStore.add({
                    bookId: book.id,
                    text,
                    pageNumber,
                    position: {
                        x: rect.x - containerRect.x,
                        y: rect.y - containerRect.y,
                        width: rect.width,
                        height: rect.height,
                    },
                    color: "primary",
                });
                setHighlights([...highlights, highlight]);
                selection.removeAllRanges();
            } catch (err) {
                console.error("Failed to save highlight:", err);
            }
        }
    }

    async function exportHighlights() {
        const md = await highlightStore.exportAsMarkdown(book.id);
        const blob = new Blob([md], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${book.title}-highlights.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function handleDeleteHighlight(id: string) {
        try {
            await highlightStore.delete(id);
            setHighlights(highlights.filter((h) => h.id !== id));
        } catch (err) {
            console.error("Failed to delete highlight:", err);
        }
    }

    const pageHighlights = highlights.filter((h) => h.pageNumber === pageNumber);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading PDF...</div>
            </div>
        );
    }

    if (!fileData) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <div className="text-destructive">Failed to load PDF data</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
            {/* Header */}
            <header className="flex items-center justify-between h-20 px-8 border-b border-border backdrop-blur-md bg-background/80 sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    >
                        <X size={18} />
                    </Button>
                    <div className="space-y-0.5">
                        <h1 className="font-semibold text-base tracking-tight truncate max-w-[400px] text-foreground">{book.title}</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wide bg-primary/10 px-2 py-0.5 rounded">
                                Neural Reader
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest">
                                Page {pageNumber} of {numPages}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={isHighlighting ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setIsHighlighting(!isHighlighting)}
                            className={cn(
                                "flex items-center gap-2 px-4 h-10 text-[11px] font-semibold uppercase tracking-wide",
                                isHighlighting && "shadow-md"
                            )}
                        >
                            <Highlighter size={14} />
                            {isHighlighting ? "Active" : "Highlight"}
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 bg-accent/50 rounded-lg p-1 border border-border">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ZoomOut size={16} />
                        </Button>
                        <div className="flex items-center justify-center w-12 border-x border-border/50">
                            <span className="text-[10px] font-bold text-foreground/80">
                                {Math.round(scale * 100)}%
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setScale((s) => Math.min(2, s + 0.2))}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ZoomIn size={16} />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={exportHighlights}
                        className="h-10 w-10 text-muted-foreground hover:text-foreground"
                        title="Export Highlights"
                    >
                        <Download size={18} />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* PDF View */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto p-8 flex justify-center"
                    onMouseUp={handleTextSelection}
                >
                    <Document
                        file={fileData}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-pulse text-muted-foreground">Loading PDF...</div>
                            </div>
                        }
                        error={
                            <div className="flex items-center justify-center h-full text-destructive">
                                Failed to load PDF
                            </div>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            className="shadow-2xl rounded-lg overflow-hidden"
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                        />
                    </Document>
                </div>

                {/* Highlights Panel */}
                <aside className="w-96 border-l border-border bg-card/50 backdrop-blur-md overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-border flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-primary">
                                Intelligence
                            </h2>
                            <p className="text-lg font-semibold text-foreground">Curated Notes</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                                {highlights.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-6 space-y-4 custom-scrollbar">
                        {highlights.length === 0 ? (
                            <p className="text-sm text-muted-foreground/60 italic">
                                Select text while in highlight mode to save notes.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {highlights.map((h) => (
                                    <div
                                        key={h.id}
                                        className={cn(
                                            "group p-5 rounded-xl border transition-all duration-300",
                                            h.pageNumber === pageNumber
                                                ? "border-primary/40 bg-primary/5 shadow-sm"
                                                : "border-border bg-card hover:border-primary/30"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                                                    Segment {h.pageNumber}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteHighlight(h.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-300"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/80 font-medium selection:bg-primary/30">
                                            "{h.text}"
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                {new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                            <div className="flex gap-1">
                                                <div className="h-1 w-4 rounded-full bg-primary/30" />
                                                <div className="h-1 w-2 rounded-full bg-primary/10" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Footer Navigation */}
            <footer className="flex items-center justify-center gap-8 h-20 border-t border-border backdrop-blur-md bg-background/80 z-20">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                    className="h-10 px-5 rounded-xl bg-accent border border-border hover:bg-muted gap-3 text-xs font-semibold uppercase tracking-wide"
                >
                    <ChevronLeft size={16} /> Previous
                </Button>

                <div className="flex items-center gap-4 bg-accent border border-border p-1 rounded-xl">
                    <input
                        type="number"
                        value={pageNumber}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= 1 && val <= numPages) setPageNumber(val);
                        }}
                        className="w-16 h-8 bg-transparent text-center text-sm font-black text-primary focus:outline-none"
                    />
                    <div className="h-4 w-px bg-border" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-2">
                        OF {numPages}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                    disabled={pageNumber >= numPages}
                    className="h-10 px-5 rounded-xl bg-accent border border-border hover:bg-muted gap-3 text-xs font-semibold uppercase tracking-wide"
                >
                    Next <ChevronRight size={16} />
                </Button>
            </footer>
        </div>
    );
}
