"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const chartData = [
    { day: "Jun 1", visitors: 400, active: 240 },
    { day: "Jun 3", visitors: 300, active: 139 },
    { day: "Jun 5", visitors: 200, active: 120 },
    { day: "Jun 7", visitors: 278, active: 190 },
    { day: "Jun 9", visitors: 189, active: 80 },
    { day: "Jun 11", visitors: 239, active: 150 },
    { day: "Jun 13", visitors: 349, active: 210 },
    { day: "Jun 15", visitors: 200, active: 110 },
    { day: "Jun 17", visitors: 278, active: 190 },
    { day: "Jun 19", visitors: 189, active: 100 },
    { day: "Jun 21", visitors: 439, active: 250 },
    { day: "Jun 23", visitors: 349, active: 190 },
    { day: "Jun 25", visitors: 200, active: 110 },
    { day: "Jun 27", visitors: 278, active: 200 },
    { day: "Jun 30", visitors: 510, active: 310 },
]

const chartConfig = {
    visitors: {
        label: "Total Visitors",
        color: "var(--primary)",
    },
    active: {
        label: "Active Users",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export function VisitorChart() {
    return (
        <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-8 py-6">
                <div>
                    <CardTitle className="text-lg font-bold">Total Visitors</CardTitle>
                    <CardDescription className="text-sm font-medium text-muted-foreground">
                        Total for the last 3 months
                    </CardDescription>
                </div>
                <Tabs defaultValue="30days" className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 h-9 p-1">
                        <TabsTrigger value="3months" className="text-[10px] font-bold uppercase transition-all">Last 3 months</TabsTrigger>
                        <TabsTrigger value="30days" className="text-[10px] font-bold uppercase transition-all">Last 30 days</TabsTrigger>
                        <TabsTrigger value="7days" className="text-[10px] font-bold uppercase transition-all">Last 7 days</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="p-0">
                <ChartContainer config={chartConfig} className="h-[350px] w-full px-4">
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 20,
                            bottom: 20
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={12}
                            tickFormatter={(value) => value}
                            hide={false}
                            fontSize={10}
                            fontWeight={600}
                            stroke="var(--muted-foreground)"
                        />
                        <YAxis
                            hide={true}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <defs>
                            <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--primary)"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--primary)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--primary)"
                                    stopOpacity={0.5}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--primary)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="visitors"
                            type="natural"
                            fill="url(#fillVisitors)"
                            fillOpacity={1}
                            stroke="var(--primary)"
                            strokeWidth={2}
                            opacity={0.4}
                            stackId="a"
                        />
                        <Area
                            dataKey="active"
                            type="natural"
                            fill="url(#fillActive)"
                            fillOpacity={1}
                            stroke="var(--primary)"
                            strokeWidth={2.5}
                            stackId="b"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
