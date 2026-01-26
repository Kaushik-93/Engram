"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings2, Plus, Users } from "lucide-react"

const documents = [
    {
        header: "Project Alpha",
        type: "Financial Report",
        target: "Executive Board",
        limit: "$50,000",
        reviewer: "Sarah Janssen",
    },
    {
        header: "Technical Specs",
        type: "Architecture",
        target: "Engineering Team",
        limit: "Unlimited",
        reviewer: "Michael Chen",
    },
    {
        header: "Growth Strategy",
        type: "Marketing",
        target: "Global Partners",
        limit: "$120,000",
        reviewer: "Elena Rodriguez",
    },
    {
        header: "Legal Compliance",
        type: "Regulatory",
        target: "Legal Dept",
        limit: "N/A",
        reviewer: "David Miller",
    },
]

export function DocumentTable() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Tabs defaultValue="outline" className="w-auto">
                    <TabsList className="bg-muted/50 p-1 h-10 border border-border/50">
                        <TabsTrigger value="outline" className="text-[11px] font-bold uppercase tracking-wider px-4">Outline</TabsTrigger>
                        <TabsTrigger value="performance" className="text-[11px] font-bold uppercase tracking-wider px-4 gap-2">
                            Past Performance
                            <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] font-bold">3</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="personnel" className="text-[11px] font-bold uppercase tracking-wider px-4 gap-2">
                            Key Personnel
                            <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] font-bold">2</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="focus" className="text-[11px] font-bold uppercase tracking-wider px-4">Focus Documents</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-4 gap-2 text-xs font-semibold rounded-lg bg-accent/50 border-border/50">
                        <Settings2 className="size-3.5" />
                        Customize Columns
                    </Button>
                    <Button variant="default" size="sm" className="h-9 px-4 gap-2 text-xs font-semibold rounded-lg">
                        <Plus className="size-3.5" />
                        Add Section
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[12px] px-4"><input type="checkbox" className="rounded border-border bg-background" /></TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 py-4">Header</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Section Type</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Target</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Limit</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Reviewer</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc, i) => (
                            <TableRow key={i} className="hover:bg-accent/30 border-border/50 transition-colors">
                                <TableCell className="px-4"><input type="checkbox" className="rounded border-border bg-background" /></TableCell>
                                <TableCell className="text-xs font-semibold text-foreground py-4">{doc.header}</TableCell>
                                <TableCell className="text-xs font-medium text-muted-foreground">{doc.type}</TableCell>
                                <TableCell className="text-xs font-medium text-muted-foreground">{doc.target}</TableCell>
                                <TableCell className="text-xs font-medium text-muted-foreground">{doc.limit}</TableCell>
                                <TableCell className="text-xs font-medium text-foreground flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                                        {doc.reviewer.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    {doc.reviewer}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
