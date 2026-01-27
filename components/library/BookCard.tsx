import { Book } from "@/lib/store";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BookCardProps {
    book: Book;
    onSelect: (book: Book) => void;
    onDelete: (book: Book) => void;
}

export function BookCard({ book, onSelect, onDelete }: BookCardProps) {
    const progress = book.total_pages > 0
        ? Math.round((book.last_read_page / book.total_pages) * 100)
        : 0;

    return (
        <Card
            className="group relative flex flex-col h-full rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
            onClick={() => onSelect(book)}
        >
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-snug text-foreground truncate">
                            {book.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-medium">
                            {book.total_pages > 0 ? `${book.total_pages} pages` : "PDF Document"}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(book);
                        }}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={13} />
                    </Button>
                </div>
            </CardContent>

            <CardFooter className="px-4 py-3 bg-muted/30 border-t border-border mt-auto">
                <div className="flex flex-col w-full gap-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Progress</span>
                        <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="relative h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
