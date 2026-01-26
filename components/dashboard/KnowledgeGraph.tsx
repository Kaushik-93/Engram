"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";

const nodes = [
    { id: 1, x: 50, y: 50, label: "Memory", strength: 8, status: "stable" },
    { id: 2, x: 180, y: 40, label: "Recall", strength: 6, status: "fragile" },
    { id: 3, x: 100, y: 150, label: "Logic", strength: 4, status: "stable" },
    { id: 4, x: 280, y: 100, label: "Focus", strength: 9, status: "stable" },
    { id: 5, x: 220, y: 200, label: "Sleep", strength: 5, status: "fragile" },
    { id: 6, x: 350, y: 180, label: "Plasticity", strength: 7, status: "stable" },
];

const connections = [
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 1, to: 3 },
    { from: 3, to: 5 },
    { from: 2, to: 5 },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
];

export function KnowledgeGraph() {
    const [selectedNode, setSelectedNode] = React.useState<number | null>(null);

    return (
        <Card className="rounded-2xl border border-border bg-card shadow-sm col-span-1 lg:col-span-2">
            <CardHeader className="pb-0">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Knowledge Graph
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden">
                    <TooltipProvider>
                        <svg viewBox="0 0 400 250" className="w-full h-full p-8 overflow-visible cursor-grab active:cursor-grabbing">
                            {/* Connections */}
                            {connections.map((conn, i) => {
                                const fromNode = nodes.find(n => n.id === conn.from)!;
                                const toNode = nodes.find(n => n.id === conn.to)!;
                                return (
                                    <line
                                        key={i}
                                        x1={fromNode.x}
                                        y1={fromNode.y}
                                        x2={toNode.x}
                                        y2={toNode.y}
                                        stroke="currentColor"
                                        className="text-border/40"
                                        strokeWidth="1"
                                    />
                                );
                            })}

                            {/* Nodes */}
                            {nodes.map((node) => (
                                <Tooltip key={node.id}>
                                    <TooltipTrigger asChild>
                                        <g
                                            className="cursor-pointer group"
                                            onClick={() => setSelectedNode(node.id)}
                                        >
                                            {/* Outer Glow */}
                                            <circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={node.strength + 4}
                                                fill="var(--primary)"
                                                className={cn(
                                                    "opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                                                    selectedNode === node.id && "opacity-20"
                                                )}
                                            />

                                            {/* Core Node */}
                                            <circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={node.strength}
                                                fill="currentColor"
                                                className={cn(
                                                    "transition-all duration-300",
                                                    node.status === "stable" ? "text-primary/70" : "text-amber-500/70",
                                                    "hover:text-primary active:scale-95"
                                                )}
                                            />

                                            {/* Label */}
                                            <text
                                                x={node.x}
                                                y={node.y - node.strength - 6}
                                                textAnchor="middle"
                                                className="text-[9px] font-bold fill-muted-foreground select-none opacity-60 group-hover:opacity-100 transition-opacity"
                                            >
                                                {node.label}
                                            </text>
                                        </g>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-[10px] py-1 px-2 font-bold flex flex-col gap-0.5">
                                        <p className="font-black text-xs">{node.label}</p>
                                        <p className="text-muted-foreground">Recall Strength: {node.strength * 10}%</p>
                                        <p className={cn(
                                            "uppercase tracking-widest text-[8px]",
                                            node.status === "stable" ? "text-primary" : "text-amber-500"
                                        )}>
                                            {node.status}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </svg>
                    </TooltipProvider>

                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.02)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none" />
                </div>

                {selectedNode && (
                    <div className="px-6 pb-6 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold">{nodes.find(n => n.id === selectedNode)?.label}</h4>
                                <p className="text-xs text-muted-foreground">Click to view detailed connections and history.</p>
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground h-full"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
