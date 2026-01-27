"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, CheckCircle2 } from "lucide-react"

const recallItems = [
    { id: 1, title: "Spaced Repetition Theory", source: "Memory Systems" },
    { id: 2, title: "Neuroplasticity in Adults", source: "Neuroscience 101" },
    { id: 3, title: "Recall vs Recognition", source: "Cognitive Psychology" },
    { id: 4, title: "The Forgetting Curve", source: "Memory Systems" },
    { id: 5, title: "Loci Method Techniques", source: "Mnemonic Devices" },
]

export function ReadyToRecall() {
    return (
        <Card className="rounded-2xl border border-primary/10 bg-primary/[0.02] shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight">Ready to Recall</CardTitle>
                        <CardDescription className="text-sm font-medium text-muted-foreground/80">
                            Concepts scheduled for recall today
                        </CardDescription>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <PlayCircle className="size-6 text-primary" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    {recallItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/20 hover:bg-primary/[0.01] transition-all group"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-sm leading-tight">{item.title}</span>
                                <span className="text-[11px] font-medium text-muted-foreground">{item.source}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="font-bold gap-1.5 hover:bg-primary hover:text-primary-foreground">
                                Start Recall
                                <PlayCircle className="size-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>

                <Button className="w-full mt-2 gap-2 shadow-lg shadow-primary/20">
                    <CheckCircle2 className="size-4" />
                    Start All Recalls
                </Button>
            </CardContent>
        </Card>
    )
}
