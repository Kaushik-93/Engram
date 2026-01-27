"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Activity, Sparkles } from "lucide-react"

// Generate dummy data for the last 12 weeks (84 days)
const generateHeatmapData = () => {
    const data = []
    const now = new Date()
    for (let i = 83; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(now.getDate() - i)
        data.push({
            date: date.toISOString().split("T")[0],
            count: Math.floor(Math.random() * 5), // 0 to 4 recalls
        })
    }
    return data
}

const days = ["Mon", "", "Wed", "", "Fri", "", "Sun"]
const weeks = 12

export function ConsistencyChart() {
    const [mounted, setMounted] = React.useState(false)
    const [data, setData] = React.useState<{ date: string; count: number }[]>([])

    React.useEffect(() => {
        setData(generateHeatmapData())
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Card className="rounded-[32px] border border-border/60 bg-card/50 overflow-hidden">
                <div className="p-8 h-full bg-muted/20 animate-pulse" />
            </Card>
        )
    }

    return (
        <Card className="rounded-[32px] border border-border/60 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden flex flex-col h-full">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                    <Activity size={12} />
                    Study Consistency
                </div>
                <CardTitle className="text-xl font-black tracking-tight leading-none">Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 flex-1 flex flex-col justify-center">
                <div className="flex gap-4">
                    {/* Day labels */}
                    <div className="flex flex-col justify-between text-[9px] text-muted-foreground font-black uppercase tracking-widest py-1 select-none">
                        {days.map((day, i) => (
                            <span key={i} className="h-3 flex items-center">{day}</span>
                        ))}
                    </div>

                    {/* Heatmap Grid */}
                    <TooltipProvider>
                        <div className="flex-1 overflow-x-auto no-scrollbar pb-2">
                            <div className="flex gap-1.5 w-fit">
                                {Array.from({ length: weeks }).map((_, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-1.5">
                                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                                            const itemIndex = weekIndex * 7 + dayIndex
                                            const item = data[itemIndex]
                                            return (
                                                <Tooltip key={dayIndex}>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            className={cn(
                                                                "h-3 w-3 rounded-[3px] transition-all duration-300 cursor-pointer hover:scale-125 hover:z-10",
                                                                !item || item.count === 0 ? "bg-muted/30 hover:bg-muted/50" : "",
                                                                item?.count === 1 && "bg-primary/20",
                                                                item?.count === 2 && "bg-primary/40",
                                                                item?.count === 3 && "bg-primary/70",
                                                                item?.count >= 4 && "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                                                            )}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="text-[10px] py-1 px-2 font-black uppercase tracking-widest animate-in fade-in zoom-in duration-200">
                                                        <p>{item?.date}: {item?.count || 0} recalls</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TooltipProvider>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-primary/5 flex items-center justify-between border border-primary/10">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Streak</span>
                        <div className="flex items-center gap-1.5 text-xl font-black text-primary">
                            <span>12 Days</span>
                            <Sparkles size={14} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
