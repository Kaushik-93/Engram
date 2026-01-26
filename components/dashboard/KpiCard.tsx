"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
    title: string
    value: string
    trend: string
    trendType: "up" | "down"
    description: string
    comparison?: string
}

export function KpiCard({ title, value, trend, trendType, description, comparison }: KpiCardProps) {
    return (
        <Card className="rounded-xl border border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
                <div className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    trendType === "up" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                )}>
                    {trendType === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {trend}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight mb-4">{value}</div>
                <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        {description}
                        {trendType === "up" ? <TrendingUp className="size-3 text-muted-foreground/60" /> : <TrendingDown className="size-3 text-muted-foreground/60" />}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                        {comparison || "Visitors for the last 6 months"}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
