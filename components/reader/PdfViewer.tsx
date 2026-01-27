"use client";

import * as React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Book, highlightStore, bookStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    X,
    Highlighter,
    Download,
    Search,
    BookOpen,
    Trash2,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface HighlightRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface FrontendHighlight {
    id: string;
    bookId: string;
    text: string;
    pageNumber: number;
    position: HighlightRect; // Original bounding box for compatibility
    rects?: HighlightRect[];  // NEW: Multiple rects for perfectly fitting multi-line selection
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
    const [highlightsSearch, setHighlightsSearch] = React.useState("");
    const [selectionMenu, setSelectionMenu] = React.useState<{
        text: string;
        rects: HighlightRect[];
        boundingBox: HighlightRect;
        pageRect: DOMRect;
    } | null>(null);
    const [isSavingHighlight, setIsSavingHighlight] = React.useState(false);
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

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();
        if (!text || text.length < 2) return;

        const clientRects = range.getClientRects();
        const pageElement = containerRef.current?.querySelector('.react-pdf__Page');
        const pageRect = pageElement?.getBoundingClientRect();

        if (pageRect && clientRects.length > 0) {
            const boundingBox = range.getBoundingClientRect();

            // Percentage math for scale-independence
            const toPerc = (val: number, max: number) => (val / max) * 100;

            const rects: HighlightRect[] = Array.from(clientRects).map(rect => ({
                x: toPerc(rect.x - pageRect.left, pageRect.width),
                y: toPerc(rect.y - pageRect.top, pageRect.height),
                width: toPerc(rect.width, pageRect.width),
                height: toPerc(rect.height, pageRect.height)
            }));

            setSelectionMenu({
                text,
                rects,
                boundingBox: {
                    x: toPerc(boundingBox.x - pageRect.left, pageRect.width),
                    y: toPerc(boundingBox.y - pageRect.top, pageRect.height),
                    width: toPerc(boundingBox.width, pageRect.width),
                    height: toPerc(boundingBox.height, pageRect.height),
                },
                pageRect: pageRect as DOMRect
            });
        }
    }

    async function confirmHighlight() {
        if (!selectionMenu || isSavingHighlight) return;

        setIsSavingHighlight(true);
        try {
            const highlight = await highlightStore.add({
                bookId: book.id,
                text: selectionMenu.text,
                pageNumber,
                position: selectionMenu.boundingBox,
                rects: selectionMenu.rects,
                color: "yellow",
            });

            setHighlights(prev => [...prev, highlight]);
            setSelectionMenu(null);
            window.getSelection()?.removeAllRanges();
        } catch (err) {
            console.error("Failed to save highlight:", err);
            // Don't clear menu so user can retry
        } finally {
            setIsSavingHighlight(false);
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

    const filteredHighlights = highlights.filter(h =>
        h.text.toLowerCase().includes(highlightsSearch.toLowerCase())
    ).sort((a, b) => a.pageNumber - b.pageNumber);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                        <BookOpen className="text-primary" size={40} />
                    </div>
                    <Loader2 className="absolute -bottom-2 -right-2 text-primary animate-spin" size={24} />
                </div>
                <p className="mt-6 text-xl font-bold tracking-tight text-foreground">Loading Document</p>
                <p className="text-muted-foreground font-medium italic mt-2">Preparing your neural workspace...</p>
            </div>
        );
    }

    if (!fileData) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto text-destructive">
                        <X size={40} />
                    </div>
                    <h2 className="text-2xl font-black">Link Broken</h2>
                    <p className="text-muted-foreground font-medium">Failed to retrieve the PDF data. It might have been deleted or moved.</p>
                    <Button onClick={onClose} variant="outline" size="lg">Return to Library</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden animate-in fade-in duration-500">
            <style jsx global>{`
                ::selection {
                    background: #f7ff58cc !important;
                    color: black !important;
                }
                .react-pdf__Page__textContent {
                    pointer-events: auto !important;
                    user-select: text !important;
                }
                .react-pdf__Page__annotations {
                    pointer-events: none !important;
                }
                .react-pdf__Page {
                    user-select: text !important;
                    position: relative !important;
                }
                /* Prevent selecting UI while dragging selection in PDF */
                .no-select-during-drag {
                    user-select: none !important;
                }
            `}</style>
            {/* Header */}
            <header className="flex items-center justify-between h-20 px-6 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30 shadow-xs">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="space-y-0.5">
                        <h1 className="font-bold text-base tracking-tight truncate max-w-[300px] lg:max-w-[500px] text-foreground">{book.title}</h1>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-sm">
                                <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                Interactive
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                Page {pageNumber} <span className="text-muted-foreground/30 mx-1">/</span> {numPages}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 mr-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={isHighlighting ? "default" : "secondary"}
                                        size="sm"
                                        onClick={() => setIsHighlighting(!isHighlighting)}
                                        className={cn(
                                            "uppercase tracking-wide text-[11px] gap-2 transition-all",
                                            isHighlighting ? "shadow-lg shadow-primary/25 scale-[1.02]" : "hover:bg-accent"
                                        )}
                                    >
                                        <Highlighter size={14} strokeWidth={3} />
                                        {isHighlighting ? "Highlight active" : "Enable Highlight"}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Enable text selection to save highlights</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="flex items-center gap-1 bg-accent/40 rounded-xl p-1 border border-border">
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ZoomOut size={16} />
                        </Button>
                        <Separator orientation="vertical" className="h-4 bg-border" />
                        <div className="w-14 text-center">
                            <span className="text-[11px] font-black text-foreground">
                                {Math.round(scale * 100)}%
                            </span>
                        </div>
                        <Separator orientation="vertical" className="h-4 bg-border" />
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setScale((s) => Math.min(2, s + 0.2))}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ZoomIn size={16} />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={exportHighlights}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent"
                        title="Export highlights (.md)"
                    >
                        <Download size={18} />
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden bg-accent/10">
                {/* PDF Canvas Area */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto p-4 lg:p-12 flex justify-center custom-scrollbar"
                    onMouseUp={handleTextSelection}
                    onMouseDown={(e) => {
                        // Only clear if not clicking the menu
                        if (!(e.target as HTMLElement).closest('.selection-menu')) {
                            setSelectionMenu(null);
                            window.getSelection()?.removeAllRanges();
                        }
                    }}
                >
                    <div className="relative group min-h-max">
                        <Document
                            file={fileData}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="select-text"
                            loading={
                                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Rendering Pages...</p>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                className="shadow-2xl rounded-sm overflow-hidden ring-1 ring-border border-2 border-border/10 relative"
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                            >
                                {/* Highlights Overlay - Nesting inside Page ensures perfect alignment with zoom */}
                                <div className="absolute inset-0 pointer-events-none select-none z-20 mix-blend-multiply">
                                    {highlights
                                        .filter((h) => h.pageNumber === pageNumber)
                                        .map((h) => {
                                            const highlightRects = h.rects || [h.position];
                                            return (
                                                <React.Fragment key={h.id}>
                                                    {highlightRects.map((rect, idx) => {
                                                        // Legacy support: if values are > 100, they might be pixels from old scales
                                                        // We'll treat them as percentages now, but this fixes new ones perfectly.
                                                        return (
                                                            <div
                                                                key={`${h.id}-${idx}`}
                                                                className="absolute bg-yellow-400/50 border-l-[0.5px] border-yellow-600/30 animate-in fade-in duration-300"
                                                                style={{
                                                                    left: `${rect.x}%`,
                                                                    top: `${rect.y}%`,
                                                                    width: `${rect.width}%`,
                                                                    height: `${rect.height}%`,
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        })}

                                    {/* Preview Highlight for active selection */}
                                    {selectionMenu && (
                                        <React.Fragment>
                                            {selectionMenu.rects.map((rect, idx) => (
                                                <div
                                                    key={`preview-${idx}`}
                                                    className="absolute bg-yellow-400/40 border-l-[1px] border-yellow-600/50 border-dashed animate-pulse"
                                                    style={{
                                                        left: `${rect.x}%`,
                                                        top: `${rect.y}%`,
                                                        width: `${rect.width}%`,
                                                        height: `${rect.height}%`,
                                                    }}
                                                />
                                            ))}
                                        </React.Fragment>
                                    )}
                                </div>

                                {/* Floating Selection Menu - Also nested for alignment */}
                                {selectionMenu && (
                                    <div
                                        className="selection-menu absolute z-50 animate-in fade-in zoom-in duration-200 pointer-events-auto"
                                        style={{
                                            left: `${selectionMenu.boundingBox.x + selectionMenu.boundingBox.width / 2}%`,
                                            top: `calc(${selectionMenu.boundingBox.y}% - 45px)`,
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmHighlight();
                                            }}
                                            disabled={isSavingHighlight}
                                            className="bg-primary text-primary-foreground shadow-2xl rounded-full px-4 h-9 font-black hover:scale-110 active:scale-95 transition-all gap-2 border-2 border-background whitespace-nowrap"
                                        >
                                            {isSavingHighlight ? (
                                                <Loader2 className="animate-spin" size={14} />
                                            ) : (
                                                <Highlighter size={14} />
                                            )}
                                            {isSavingHighlight ? "Saving..." : "Highlight"}
                                        </Button>
                                    </div>
                                )}
                            </Page>
                        </Document>
                    </div>
                </div>

                {/* Intelligence Sidebar */}
                <aside className="hidden lg:flex w-[400px] flex-col bg-card border-l border-border shadow-2xl z-20 h-full overflow-hidden">
                    <div className="p-8 space-y-6 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded-sm inline-block">
                                    Insights
                                </h2>
                                <p className="text-xl font-black text-foreground">Distilled Notes</p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center">
                                <span className="text-sm font-black text-primary">
                                    {highlights.length}
                                </span>
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search insights..."
                                value={highlightsSearch}
                                onChange={(e) => setHighlightsSearch(e.target.value)}
                                className="h-10 pl-9 bg-accent/20 border-border/50 rounded-xl text-xs font-medium focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-8 pb-8 space-y-4">
                            {filteredHighlights.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-5">
                                    <div className="h-20 w-20 rounded-3xl bg-accent/20 flex items-center justify-center border-2 border-dashed border-border/50">
                                        <Highlighter size={28} className="text-muted-foreground/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-foreground font-black">No Insights Found</p>
                                        <p className="text-[11px] text-muted-foreground font-medium max-w-[200px]">
                                            {highlightsSearch
                                                ? "Try a different search term or check another page."
                                                : "Start highlighting text in the document to see your insights here."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredHighlights.map((h) => (
                                        <div
                                            key={h.id}
                                            onClick={() => setPageNumber(h.pageNumber)}
                                            className={cn(
                                                "group flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer relative",
                                                h.pageNumber === pageNumber
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                                                    : "border-border/60 bg-card hover:border-primary/30 hover:shadow-md"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full transition-all",
                                                        h.pageNumber === pageNumber ? "bg-yellow-500 scale-125" : "bg-muted-foreground/40"
                                                    )} />
                                                    <span className="text-[9px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded-md">
                                                        Page {h.pageNumber}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteHighlight(h.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </Button>
                                            </div>
                                            <p className="text-xs leading-relaxed text-foreground/90 font-medium border-l-2 border-yellow-500/50 pl-3 italic bg-yellow-500/5 py-1 rounded-r-sm">
                                                "{h.text}"
                                            </p>
                                            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                                                <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-tight">
                                                    ID: {h.id.slice(0, 6)}
                                                </span>
                                                <span className="text-[8px] font-extrabold text-muted-foreground/60 uppercase">
                                                    {new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-8 border-t border-border bg-accent/5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground mb-3">
                            <span>Reading Progress</span>
                            <span>{Math.round((pageNumber / numPages) * 100)}%</span>
                        </div>
                        <div className="relative h-1.5 w-full bg-border rounded-full overflow-hidden">
                            <div
                                className="absolute h-full bg-primary transition-all duration-700"
                                style={{ width: `${(pageNumber / numPages) * 100}%` }}
                            />
                        </div>
                    </div>
                </aside>
            </div>

            {/* Navigation Footer */}
            <footer className="flex items-center justify-center gap-10 h-20 px-6 border-t border-border bg-card/80 backdrop-blur-xl z-20">
                <Button
                    variant="ghost"
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                    className="uppercase tracking-wide text-xs gap-3 transition-all hover:bg-accent disabled:opacity-30"
                >
                    <ChevronLeft size={18} /> Prev
                </Button>

                <div className="flex items-center gap-6 bg-accent/50 border border-border px-6 py-2 rounded-2xl shadow-inner">
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            min={1}
                            max={numPages}
                            value={pageNumber}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val >= 1 && val <= numPages) setPageNumber(val);
                            }}
                            className="w-12 bg-transparent text-center text-lg font-black text-primary focus:outline-none focus:ring-0"
                        />
                        <span className="text-[10px] font-black text-muted-foreground/30 uppercase">Page</span>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-border" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Total</span>
                        <span className="text-sm font-black text-foreground">{numPages}</span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                    disabled={pageNumber >= numPages}
                    className="uppercase tracking-wide text-xs gap-3 transition-all hover:bg-accent disabled:opacity-30"
                >
                    Next <ChevronRight size={18} />
                </Button>
            </footer>
        </div>
    );
}
