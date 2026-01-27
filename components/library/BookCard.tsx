import { Book } from "@/lib/store";
import { Trash2, Heart, Book as BookIcon, MoreVertical } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookCardProps {
    book: Book;
    onSelect: (book: Book) => void;
    onDelete: (book: Book) => void;
    onToggleFavorite: (book: Book) => void;
}

export function BookCard({ book, onSelect, onDelete, onToggleFavorite }: BookCardProps) {
    const progress = book.total_pages > 0
        ? Math.round((book.last_read_page / book.total_pages) * 100)
        : 0;

    return (
        <Card
            className="group relative flex flex-col h-full rounded-[40px] border border-border/40 bg-card/40 backdrop-blur-xl hover:border-primary/40 hover:shadow-[0_40px_80px_-20px_rgba(var(--primary-rgb),0.15)] transition-all duration-700 cursor-pointer overflow-hidden pb-2 active:scale-[0.98] isolate"
            onClick={() => onSelect(book)}
        >
            {/* Visual Cover Area */}
            <div className="h-64 bg-gradient-to-br from-primary/[0.05] via-primary/[0.02] to-transparent relative p-6 flex items-center justify-center overflow-hidden">
                {/* Background Neural Hub Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0,rgba(var(--primary-rgb),0.03)_0.25turn,transparent_0.5turn)] animate-[spin_12s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                {/* 3D Floating Book Effect */}
                <div className="relative z-10 perspective-[1000px]">
                    <div className="h-44 w-32 rounded-r-xl bg-background border-2 border-primary/20 shadow-[20px_20px_60px_-10px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center relative transform group-hover:rotate-y-[-20deg] group-hover:rotate-x-[10deg] group-hover:translate-z-[40px] transition-all duration-700 ease-out overflow-hidden group/book">
                        {/* Book Spine Detail */}
                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-primary/10 border-r border-primary/20" />

                        {/* Book Pattern */}
                        <div className="absolute inset-4 opacity-5 bg-[radial-gradient(circle_at_2px_2px,currentColor_1px,transparent_0)] bg-[length:12px_12px] text-primary" />

                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/book:scale-110 transition-transform duration-500">
                                <BookIcon size={32} strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-primary/30">Library Item</span>
                                <div className="h-0.5 w-8 bg-primary/20 mt-1 rounded-full" />
                            </div>
                        </div>

                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Floating Tags/Badges */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(book);
                        }}
                        className={cn(
                            "h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group/heart scale-90 hover:scale-100",
                            book.is_favorite ? "text-primary border-primary/40 shadow-lg shadow-primary/20" : "text-white/60"
                        )}
                    >
                        <Heart
                            size={18}
                            className={cn(
                                "transition-all duration-500",
                                book.is_favorite ? "fill-primary scale-110" : "group-hover/heart:scale-110"
                            )}
                        />
                    </Button>
                </div>

                {/* Page Count Badge */}
                <div className="absolute bottom-6 left-6 z-20">
                    <div className="px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-[9px] font-black text-white/80 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        {book.total_pages > 0 ? `${book.total_pages} Pages` : "Dynamic PDF"}
                    </div>
                </div>
            </div>

            <CardContent className="p-8 flex-1 flex flex-col gap-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                        <h3 className="font-black text-lg leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-500 uppercase tracking-tight">
                            {book.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em]">
                            <span>Library Resource</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>{new Date(book.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all">
                                <MoreVertical size={18} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-[24px] p-2 border-border/60 backdrop-blur-2xl bg-card/80">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 text-xs font-black rounded-xl cursor-pointer p-4 uppercase tracking-widest gap-3"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(book);
                                }}
                            >
                                <Trash2 size={16} />
                                Delete Resource
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-4 mt-auto">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Study Progress</p>
                            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">Retention Score</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-primary tracking-tighter italic">{progress}<span className="text-xs ml-0.5 not-italic">%</span></span>
                        </div>
                    </div>
                    <div className="relative h-2 w-full bg-muted/40 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
