"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Share2 } from "lucide-react"

export function QuickActions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
                variant="outline"
                className="h-14 rounded-xl border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-3 text-sm font-bold shadow-sm group"
            >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="size-4" />
                </div>
                Go to Library
            </Button>

            <Button
                variant="outline"
                className="h-14 rounded-xl border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-3 text-sm font-bold shadow-sm group"
            >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="size-4" />
                </div>
                Review Notes
            </Button>

            <Button
                variant="outline"
                className="h-14 rounded-xl border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-3 text-sm font-bold shadow-sm group"
            >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Share2 className="size-4" />
                </div>
                Explore Graph
            </Button>
        </div>
    )
}
