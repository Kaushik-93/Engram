"use client";

import * as React from "react";
import Markdown from 'react-markdown';
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FlashcardItem } from "./FlashcardItem";
import { Book, highlightStore, bookStore, flashcardStore, Flashcard } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
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
    Loader2,
    Sparkles,
    Wand2,
    Zap,
    Brain,
    Activity,
    GalleryVerticalEnd,
    RotateCw,
    MessageSquare,
    Send,
    PanelRightClose,
    PanelRightOpen
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
    const [flashcards, setFlashcards] = React.useState<Flashcard[]>([]);
    const [isHighlighting, setIsHighlighting] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [highlightsSearch, setHighlightsSearch] = React.useState("");
    const [isGeneratingCards, setIsGeneratingCards] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState("insights");
    const [chatContext, setChatContext] = React.useState<string>("");
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    // Chat for Q&A
    const [input, setInput] = React.useState("");
    const { messages, sendMessage, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/ai/ask",
        }),
    });

    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollArea) {
                scrollArea.scrollTop = scrollArea.scrollHeight;
            }
        }
    }, [messages]);

    console.log("Chat Messages:", messages);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const handleChatSubmit = (contextOverride?: string) => { // Removed event arg as it's handled in form onSubmit
        if (!input.trim()) return;
        sendMessage(
            { text: input },
            { body: { context: contextOverride || chatContext } }
        );
        setInput("");
    };

    const [selectionMenu, setSelectionMenu] = React.useState<{
        text: string;
        rects: HighlightRect[];
        boundingBox: HighlightRect;
        pageRect: DOMRect;
    } | null>(null);
    const [isSavingHighlight, setIsSavingHighlight] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Extract text from specific pages for local context (used for flashcards)
    async function getLocalPageContext(pageNums: number[]): Promise<string> {
        if (!fileData) return "";
        try {
            const base64Payload = fileData.split(",")[1] || fileData;
            const binaryString = window.atob(base64Payload);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const pdf = await pdfjs.getDocument({ data: bytes }).promise;
            let context = "";
            for (const pageNum of pageNums) {
                if (pageNum < 1 || pageNum > pdf.numPages) continue;
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const text = textContent.items.map((item: any) => item.str).join(" ");
                context += `Page ${pageNum}: ${text}\n\n`;
            }
            return context;
        } catch (err) {
            console.error("Failed to extract local context:", err);
            return "";
        }
    }

    // Load file data and highlights on mount
    React.useEffect(() => {
        async function load() {
            setIsLoading(true);
            try {
                const data = await bookStore.getFileData(book.id);
                if (data) {
                    setFileData(data);
                }
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

    // Load flashcards
    React.useEffect(() => {
        async function loadFlashcards() {
            try {
                const cards = await flashcardStore.getByBook(book.id);
                setFlashcards(cards);
            } catch (err) {
                console.error("Failed to load flashcards:", err);
            }
        }
        loadFlashcards();
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

        if (pageElement && clientRects.length > 0) {
            const pageRect = pageElement.getBoundingClientRect();
            // Get border width to subtract from coordinates
            // This is critical because boundingBox includes borders, but child absolute positioning is inside borders
            const computedStyle = window.getComputedStyle(pageElement);
            const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
            const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;

            // Content box dimensions (inner width/height without borders)
            const contentWidth = isNaN(parseFloat(computedStyle.width)) ? pageRect.width : parseFloat(computedStyle.width);
            const contentHeight = isNaN(parseFloat(computedStyle.height)) ? pageRect.height : parseFloat(computedStyle.height);

            const boundingBox = range.getBoundingClientRect();

            // Percentage math for scale-independence
            const toPerc = (val: number, max: number) => (val / max) * 100;

            const rawRects: HighlightRect[] = Array.from(clientRects).map(rect => ({
                x: toPerc(rect.x - pageRect.left - borderLeft, contentWidth),
                y: toPerc(rect.y - pageRect.top - borderTop, contentHeight),
                width: toPerc(rect.width, contentWidth),
                height: toPerc(rect.height, contentHeight)
            }));

            const rects = mergeRects(rawRects);

            setSelectionMenu({
                text,
                rects,
                boundingBox: {
                    x: toPerc(boundingBox.x - pageRect.left - borderLeft, contentWidth),
                    y: toPerc(boundingBox.y - pageRect.top - borderTop, contentHeight),
                    width: toPerc(boundingBox.width, contentWidth),
                    height: toPerc(boundingBox.height, contentHeight),
                },
                pageRect: pageRect as DOMRect
            });
        }
    }

    // Helper to merge adjacent/overlapping rects
    function mergeRects(rects: HighlightRect[]): HighlightRect[] {
        if (rects.length === 0) return [];

        // 1. Sort by Y then X
        const sorted = [...rects].sort((a, b) => {
            // Use a small tolerance for Y to group lines
            if (Math.abs(a.y - b.y) > 0.5) return a.y - b.y;
            return a.x - b.x;
        });

        const merged: HighlightRect[] = [];
        if (sorted.length === 0) return [];

        let current = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            const next = sorted[i];

            // Check if on same line (allow small tolerance)
            const sameLine = Math.abs(current.y - next.y) < 1 && Math.abs(current.height - next.height) < 1;

            // Check if overlapping or adjacent horizontally (slight overlap allowed for continuity)
            const overlaps = next.x < (current.x + current.width + 0.5);

            if (sameLine && overlaps) {
                // Merge coordinates
                const newX = Math.min(current.x, next.x);
                const newWidth = Math.max(current.x + current.width, next.x + next.width) - newX;
                current = { ...current, x: newX, width: newWidth };
            } else {
                merged.push(current);
                current = next;
            }
        }
        merged.push(current);
        return merged;
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

    async function extractContext(centerPage: number, question?: string): Promise<{ text: string; context: string }> {


        try {
            if (question) {
                // Use Vector Search API
                const response = await fetch("/api/embeddings/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: question,
                        bookId: book.id,
                        limit: 7
                    })
                });


                if (!response.ok) throw new Error("Vector search failed");
                const { results } = await response.json();

                // Sort results by page number for coherence
                const sortedResults = [...results].sort((a: any, b: any) => a.page_number - b.page_number);

                let context = sortedResults
                    .map((r: any) => `Page ${r.page_number}: ${r.content}`)
                    .join("\n\n");

                // Always add current page as a baseline context
                const currentPageContext = await getLocalPageContext([centerPage]);
                if (currentPageContext && !context.includes(`Page ${centerPage}:`)) {
                    context = `Current View (Page ${centerPage}):\n${currentPageContext}\n\nSearch Results:\n${context}`;
                }

                return { text: "", context: context || "No relevant chunks found." };
            } else {
                // Fallback: use current page + neighbors for flashcards
                const pageNums = [centerPage - 1, centerPage, centerPage + 1];
                const context = await getLocalPageContext(pageNums);
                return { text: "", context };
            }
        } catch (err) {
            console.error("Failed to extract context:", err);
            // Fallback to local context on error
            const context = await getLocalPageContext([centerPage - 1, centerPage, centerPage + 1]);
            return { text: "", context };
        }
    }

    async function handleGenerateFlashcards() {
        if (!selectionMenu) return;
        setIsGeneratingCards(true);
        setActiveTab("flashcards"); // Switch tab to show progress

        try {
            // Get context from current page and surrounding
            const { context } = await extractContext(pageNumber, undefined);
            const textToConvert = selectionMenu.text;

            const generatedCards = await flashcardStore.generate(textToConvert, context);

            // Save to DB
            const savedCards = await Promise.all(generatedCards.map(card =>
                flashcardStore.add({
                    bookId: book.id,
                    front: card.front,
                    back: card.back
                })
            ));

            setFlashcards(prev => [...savedCards, ...prev]);
            setSelectionMenu(null);
            window.getSelection()?.removeAllRanges();
        } catch (err) {
            console.error("Failed to generate flashcards:", err);
        } finally {
            setIsGeneratingCards(false);
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
            <header className="flex items-center justify-between h-20 px-8 border-b border-border/60 bg-card/50 backdrop-blur-xl sticky top-0 z-30 shadow-xl shadow-primary/5">
                <div className="flex items-center gap-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl h-12 w-12 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </Button>
                    <div className="space-y-0.5">
                        <h1 className="font-black text-lg tracking-tight truncate max-w-[300px] lg:max-w-[500px] text-foreground uppercase">{book.title}</h1>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full border border-primary/10">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                Neural Reader Active
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em]">
                                Page <span className="text-foreground">{pageNumber}</span> <span className="text-muted-foreground/30 mx-1">/</span> {numPages}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 mr-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={isHighlighting ? "default" : "secondary"}
                                        size="sm"
                                        onClick={() => setIsHighlighting(!isHighlighting)}
                                        className={cn(
                                            "uppercase tracking-[0.1em] text-[10px] font-black h-10 px-5 rounded-2xl gap-2 transition-all duration-500",
                                            isHighlighting
                                                ? "shadow-xl shadow-primary/25 bg-primary text-primary-foreground scale-[1.05]"
                                                : "bg-muted/50 hover:bg-accent border border-border/40"
                                        )}
                                    >
                                        <Highlighter size={14} strokeWidth={4} />
                                        {isHighlighting ? "Neural Capture ON" : "Enable Capture"}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-xl font-bold">Extract and encrypt insights from text</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="flex items-center gap-1 bg-muted/30 rounded-2xl p-1.5 border border-border/40 shadow-inner">
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
                            className="text-muted-foreground hover:text-primary rounded-xl"
                        >
                            <ZoomOut size={18} />
                        </Button>
                        <Separator orientation="vertical" className="h-4 bg-border/40" />
                        <div className="w-16 text-center">
                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                {Math.round(scale * 100)}%
                            </span>
                        </div>
                        <Separator orientation="vertical" className="h-4 bg-border/40" />
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setScale((s) => Math.min(2, s + 0.2))}
                            className="text-muted-foreground hover:text-primary rounded-xl"
                        >
                            <ZoomIn size={18} />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={exportHighlights}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl h-11 w-11"
                        title="Export highlights (.md)"
                    >
                        <Download size={20} />
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.02)_1px,transparent_1px)] bg-[length:40px_40px]">
                {/* PDF Canvas Area */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto p-4 lg:p-12 flex justify-center custom-scrollbar scroll-smooth"
                    onMouseUp={handleTextSelection}
                    onMouseDown={(e) => {
                        // Only clear if not clicking the menu
                        if (!(e.target as HTMLElement).closest('.selection-menu')) {
                            setSelectionMenu(null);
                            window.getSelection()?.removeAllRanges();
                        }
                    }}
                >
                    <div className="relative group min-h-max mb-20 animate-in zoom-in-95 fade-in duration-1000">
                        <Document
                            file={fileData}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="select-text"
                            loading={
                                <div className="flex flex-col items-center justify-center p-32 space-y-6">
                                    <div className="relative">
                                        <Loader2 className="animate-spin text-primary" size={48} />
                                        <Sparkles className="absolute -top-4 -right-4 text-primary animate-pulse" size={24} />
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Initializing Neural Workspace...</p>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden ring-1 ring-border/50 border-8 border-background relative"
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                            >
                                {/* Highlights Overlay - Nesting inside Page ensures perfect alignment with zoom */}
                                <div className="absolute inset-0 pointer-events-none select-none z-20 mix-blend-multiply opacity-80">
                                    {highlights
                                        .filter((h) => h.pageNumber === pageNumber)
                                        .map((h) => {
                                            const highlightRects = h.rects || [h.position];
                                            return (
                                                <React.Fragment key={h.id}>
                                                    {highlightRects.map((rect, idx) => {
                                                        return (
                                                            <div
                                                                key={`${h.id}-${idx}`}
                                                                className="absolute bg-yellow-400/60 animate-in fade-in duration-500 rounded-[2px]"
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
                                                    className="absolute bg-yellow-400/40 border-[1px] border-yellow-600/50 border-dashed animate-pulse rounded-[2px]"
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
                                        className="selection-menu absolute z-50 animate-in fade-in zoom-in duration-300 pointer-events-auto"
                                        style={{
                                            left: `${selectionMenu.boundingBox.x + selectionMenu.boundingBox.width / 2}%`,
                                            top: `calc(${selectionMenu.boundingBox.y}% - 55px)`,
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
                                            className="bg-primary text-primary-foreground shadow-2xl rounded-2xl px-6 h-11 font-black hover:scale-110 active:scale-95 transition-all gap-2 border-2 border-background whitespace-nowrap uppercase tracking-widest text-[10px]"
                                        >
                                            {isSavingHighlight ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                <Wand2 size={16} />
                                            )}
                                            {isSavingHighlight ? "Synthesizing..." : "Capture insight"}
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleGenerateFlashcards();
                                            }}
                                            disabled={isGeneratingCards}
                                            className="bg-secondary text-secondary-foreground shadow-2xl rounded-2xl px-6 h-11 font-black hover:scale-110 active:scale-95 transition-all gap-2 border-2 border-background whitespace-nowrap uppercase tracking-widest text-[10px]"
                                        >
                                            {isGeneratingCards ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                <GalleryVerticalEnd size={16} />
                                            )}
                                            {isGeneratingCards ? "Generating..." : "Make Flashcards"}
                                        </Button>
                                    </div>
                                )}
                            </Page>
                        </Document>
                    </div>
                </div>

                {/* Sidebar Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={cn(
                        "fixed top-1/2 -translate-y-1/2 z-30 h-12 w-6 rounded-l-xl rounded-r-none bg-card/80 backdrop-blur-xl border border-r-0 border-border/60 shadow-lg hover:bg-card transition-all duration-300 hidden lg:flex items-center justify-center",
                        sidebarCollapsed ? "right-0" : "right-[420px]"
                    )}
                >
                    {sidebarCollapsed ? <PanelRightOpen size={16} className="text-muted-foreground" /> : <PanelRightClose size={16} className="text-muted-foreground" />}
                </Button>

                {/* Intelligence Sidebar */}
                <aside className={cn(
                    "hidden lg:flex flex-col bg-card/40 backdrop-blur-2xl border-l border-border/60 shadow-2xl z-20 h-full overflow-hidden transition-all duration-300",
                    sidebarCollapsed ? "w-0 border-l-0" : "w-[420px]"
                )}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                        <div className="p-8 pb-0 shrink-0 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-primary font-bold tracking-[0.2em] uppercase text-[9px]">
                                        <Zap size={12} />
                                        Neural Distillation
                                    </div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight">
                                        {activeTab === "insights" ? "Insights" : activeTab === "flashcards" ? "Flashcards" : "Neural Chat"}
                                    </h2>
                                </div>
                                <div className="h-14 w-14 rounded-[20px] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner group">
                                    <span className="text-lg font-black text-primary group-hover:scale-110 transition-transform">
                                        {activeTab === "insights" ? highlights.length : activeTab === "flashcards" ? flashcards.length : "AI"}
                                    </span>
                                </div>
                            </div>

                            <TabsList className="grid w-full grid-cols-3 h-11 p-1 bg-muted/50 rounded-2xl border border-border/40">
                                <TabsTrigger value="insights" className="rounded-xl font-bold uppercase tracking-wider text-[10px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">Insights</TabsTrigger>
                                <TabsTrigger value="flashcards" className="rounded-xl font-bold uppercase tracking-wider text-[10px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">Cards</TabsTrigger>
                                <TabsTrigger value="chat" className="rounded-xl font-bold uppercase tracking-wider text-[10px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">Chat</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-hidden relative mt-6">
                            {/* HIGHLIGHTS TAB */}
                            <TabsContent value="insights" className="h-full absolute inset-0 flex flex-col mt-0 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-2 duration-500">
                                <div className="px-8 pb-4">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-4 w-4 group-focus-within:text-primary transition-all" />
                                        <Input
                                            placeholder="Search neural patterns..."
                                            value={highlightsSearch}
                                            onChange={(e) => setHighlightsSearch(e.target.value)}
                                            className="h-12 pl-11 bg-background/50 border-border/40 rounded-[18px] text-xs font-bold uppercase tracking-widest focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 min-h-0">
                                    <div className="px-8 pb-10 space-y-6">
                                        {filteredHighlights.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                                                <div className="h-24 w-24 rounded-[32px] bg-primary/5 flex items-center justify-center border-2 border-dashed border-primary/10 relative">
                                                    <Sparkles size={32} className="text-primary/20" />
                                                    <Brain size={16} className="absolute inset-0 m-auto text-primary/40 animate-pulse" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs text-foreground font-black uppercase tracking-[0.2em]">Void Detected</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest max-w-[220px] leading-relaxed">
                                                        {highlightsSearch
                                                            ? "Pattern mismatch. Try a broader search term."
                                                            : "Start capturing insights to populate your neural database."}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-5">
                                                {filteredHighlights.map((h) => (
                                                    <div
                                                        key={h.id}
                                                        onClick={() => setPageNumber(h.pageNumber)}
                                                        className={cn(
                                                            "group flex flex-col p-6 rounded-[28px] border transition-all duration-500 cursor-pointer relative overflow-hidden",
                                                            h.pageNumber === pageNumber
                                                                ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-2xl shadow-primary/10"
                                                                : "border-border/60 bg-card/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "h-2 w-2 rounded-full transition-all duration-500",
                                                                    h.pageNumber === pageNumber ? "bg-primary scale-125 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" : "bg-muted-foreground/20"
                                                                )} />
                                                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full border border-primary/10">
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
                                                                className="opacity-0 group-hover:opacity-100 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                        <div className="relative">
                                                            <p className="text-[13px] leading-relaxed text-foreground/90 font-medium border-l-3 border-primary/30 pl-4 italic bg-primary/[0.02] py-2 rounded-r-xl">
                                                                "{h.text}"
                                                            </p>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                                                            <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                                                                {h.id.slice(0, 8)}
                                                            </span>
                                                            <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                                Captured {new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            {/* FLASHCARDS TAB */}
                            <TabsContent value="flashcards" className="h-full absolute inset-0 flex flex-col mt-0 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-2 duration-500">
                                <ScrollArea className="flex-1 min-h-0">
                                    <div className="px-8 pb-10 space-y-6">
                                        {flashcards.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                                                <div className="h-24 w-24 rounded-[32px] bg-secondary/10 flex items-center justify-center border-2 border-dashed border-secondary/20 relative">
                                                    <GalleryVerticalEnd size={32} className="text-secondary" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs text-foreground font-black uppercase tracking-[0.2em]">No Cards Yet</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest max-w-[220px] leading-relaxed">
                                                        Highlight text and click "Make Flashcards" to generate study material.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {flashcards.map((card, idx) => (
                                                    <FlashcardItem
                                                        key={card.id}
                                                        card={card}
                                                        index={idx}
                                                        onDelete={(id) => {
                                                            flashcardStore.delete(id).then(() => {
                                                                setFlashcards(prev => prev.filter(c => c.id !== id));
                                                            });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="chat" className="h-full absolute inset-0 flex flex-col mt-0 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-bottom-2 duration-500">
                                <ScrollArea ref={scrollRef} className="flex-1 p-8 min-h-0">
                                    <div className="space-y-6 pb-4">
                                        {messages.length === 0 && (
                                            <div className="text-center space-y-4 py-12">
                                                <div className="bg-primary/5 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <MessageSquare className="text-primary" size={24} />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ask Neural AI about this document</p>
                                            </div>
                                        )}
                                        {messages.map((m: any) => (
                                            <div key={m.id} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
                                                {m.role !== 'user' && (
                                                    <div className="h-8 w-8 rounded-xl bg-card border flex items-center justify-center shrink-0 shadow-sm">
                                                        <Brain size={14} />
                                                    </div>
                                                )}
                                                <div className={cn("rounded-2xl p-4 text-xs font-medium leading-relaxed max-w-[85%] shadow-sm",
                                                    m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-card border text-foreground"
                                                )}>
                                                    <div className="markdown-content">
                                                        <Markdown>
                                                            {m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || m.content || ''}
                                                        </Markdown>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-4 bg-card/50 backdrop-blur-xl border-t border-border/60">
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        // Update context before submitting with smart retrieval
                                        extractContext(pageNumber, input).then(({ context }) => {
                                            setChatContext(context);
                                            handleChatSubmit(context);
                                        });
                                    }} className="relative">
                                        <Input
                                            value={input}
                                            onChange={handleInputChange}
                                            placeholder="Ask a question about this page..."
                                            className="pr-12 bg-background/50 border-border/60 h-12 rounded-2xl text-xs font-medium focus-visible:ring-primary/20"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon-xs"
                                            className="absolute right-2 top-2 h-8 w-8 rounded-xl bg-primary shadow-lg hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Send size={14} />
                                        </Button>
                                    </form>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </aside>
            </div>

            {/* Navigation Footer */}
            <footer className="flex items-center justify-center gap-12 h-24 px-8 border-t border-border/60 bg-card/60 backdrop-blur-2xl z-30 shadow-2xl">
                <Button
                    variant="ghost"
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                    className="uppercase tracking-[0.2em] text-[10px] font-black gap-4 h-12 px-8 rounded-2xl transition-all hover:bg-primary/5 hover:text-primary disabled:opacity-30 group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Prev <span className="hidden sm:inline">Chapter</span>
                </Button>

                <div className="flex items-center gap-10 bg-muted/30 border border-border/60 px-10 py-3 rounded-[24px] shadow-inner group transition-all hover:border-primary/30">
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min={1}
                            max={numPages}
                            value={pageNumber}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val >= 1 && val <= numPages) setPageNumber(val);
                            }}
                            className="w-16 bg-transparent text-center text-3xl font-black text-primary focus:outline-none focus:ring-0 selection:bg-primary/20"
                        />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] leading-none">Current</span>
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-1">Engram</span>
                        </div>
                    </div>
                    <Separator orientation="vertical" className="h-10 bg-border/60" />
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] leading-none">Total</span>
                            <span className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] leading-none mt-1">Capacity</span>
                        </div>
                        <span className="text-2xl font-black text-foreground tracking-tight">{numPages}</span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                    disabled={pageNumber >= numPages}
                    className="uppercase tracking-[0.2em] text-[10px] font-black gap-4 h-12 px-8 rounded-2xl transition-all hover:bg-primary/5 hover:text-primary disabled:opacity-30 group"
                >
                    <span className="hidden sm:inline">Next</span> <span className="hidden sm:inline">Chapter</span> <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
            </footer>

        </div>
    );
}
