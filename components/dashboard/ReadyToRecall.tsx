"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, CheckCircle2, Sparkles, Brain, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const recallItems = [
    { id: 1, title: "Spaced Repetition Theory", source: "Memory Systems", due: "Immediate" },
    { id: 2, title: "Neuroplasticity in Adults", source: "Neuroscience 101", due: "High Priority" },
    { id: 3, title: "Recall vs Recognition", source: "Cognitive Psychology", due: "Daily Goal" },
    { id: 4, title: "The Forgetting Curve", source: "Memory Systems", due: "Scheduled" },
]

export function ReadyToRecall() {
    return (
        <Card className="rounded-[32px] border border-border/60 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                            <Sparkles size={12} />
                            Ready to Study
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tight">Daily <span className="text-primary italic">Review</span></CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground/80">
                            Concepts scheduled for active review today
                        </CardDescription>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Brain className="size-6" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-2 space-y-6">
                <div className="grid gap-3">
                    {recallItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-3xl bg-background/50 border border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-black text-sm leading-tight group-hover:text-primary transition-colors">{item.title}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.source}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-[10px] font-black text-primary/70 uppercase tracking-tighter">{item.due}</span>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    ))}
                </div>

                <Button className="w-full h-12 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all gap-2">
                    <PlayCircle className="size-4" />
                    Start Study Session
                </Button>
            </CardContent>
        </Card>
    )
}
