"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Share2, Sparkles, Brain, Target } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/library" className="w-full">
                <Button
                    variant="outline"
                    className="w-full h-20 rounded-[24px] border-border/40 bg-card/40 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden"
                >
                    <div className="flex items-center gap-4 relative z-10 w-full px-2">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                            <BookOpen className="size-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black tracking-tight uppercase">Study Library</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Books</p>
                        </div>
                    </div>
                </Button>
            </Link>

            <Link href="/notes" className="w-full">
                <Button
                    variant="outline"
                    className="w-full h-20 rounded-[24px] border-border/40 bg-card/40 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden"
                >
                    <div className="flex items-center gap-4 relative z-10 w-full px-2">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                            <FileText className="size-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black tracking-tight uppercase">Review Insights</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Study Notes</p>
                        </div>
                    </div>
                </Button>
            </Link>

            <Link href="/recall" className="w-full">
                <Button
                    variant="outline"
                    className="w-full h-20 rounded-[24px] border-border/40 bg-card/40 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden"
                >
                    <div className="flex items-center gap-4 relative z-10 w-full px-2">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                            <Target className="size-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black tracking-tight uppercase">Review Session</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Recall</p>
                        </div>
                    </div>
                </Button>
            </Link>
        </div>
    )
}
