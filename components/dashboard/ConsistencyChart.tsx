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
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Consistency
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[120px] w-full bg-muted/10 animate-pulse rounded-lg" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Consistency
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        {/* Day labels */}
                        <div className="flex flex-col justify-between text-[10px] text-muted-foreground font-medium pb-2 select-none">
                            {days.map((day, i) => (
                                <span key={i} className="h-3 flex items-center">{day}</span>
                            ))}
                        </div>

                        {/* Heatmap Grid */}
                        <TooltipProvider>
                            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
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
                                                                "h-3 w-3 rounded-[2px] transition-colors cursor-pointer",
                                                                !item || item.count === 0 ? "bg-muted/30" : "",
                                                                item?.count === 1 && "bg-primary/20",
                                                                item?.count === 2 && "bg-primary/40",
                                                                item?.count === 3 && "bg-primary/70",
                                                                item?.count >= 4 && "bg-primary"
                                                            )}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="text-[10px] py-1 px-2 font-bold animate-in fade-in zoom-in duration-200">
                                                        <p>{item?.date}: {item?.count || 0} recalls completed</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
