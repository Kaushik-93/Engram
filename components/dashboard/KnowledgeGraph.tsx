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
import { Share2, Sparkles, Brain, Target, Info } from "lucide-react";

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
        <Card className="rounded-[32px] border border-border/60 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 col-span-1 lg:col-span-2 overflow-hidden">
            <CardHeader className="p-8 pb-0">
                <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                    <Share2 size={12} />
                    Synced Topics
                </div>
                <CardTitle className="text-xl font-black tracking-tight">Knowledge <span className="text-primary italic">Graph</span></CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative w-full h-[350px] flex items-center justify-center overflow-hidden group">
                    <TooltipProvider>
                        <svg viewBox="0 0 400 250" className="w-full h-full p-12 overflow-visible cursor-grab active:cursor-grabbing transition-transform duration-1000 group-hover:scale-105">
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
                                        className="text-primary/10"
                                        strokeWidth="1.5"
                                        strokeDasharray="4 2"
                                    />
                                );
                            })}

                            {/* Nodes */}
                            {nodes.map((node) => (
                                <Tooltip key={node.id}>
                                    <TooltipTrigger asChild>
                                        <g
                                            className="cursor-pointer group/node"
                                            onClick={() => setSelectedNode(node.id)}
                                        >
                                            {/* Outer Glow */}
                                            <circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={node.strength + 8}
                                                fill="var(--primary)"
                                                className={cn(
                                                    "opacity-0 transition-opacity duration-300",
                                                    (selectedNode === node.id || selectedNode === null) && "group-hover/node:opacity-5",
                                                    selectedNode === node.id && "opacity-10"
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
                                                    node.status === "stable" ? "text-primary/80" : "text-amber-500/80",
                                                    "hover:scale-125 hover:text-primary active:scale-95 shadow-xl"
                                                )}
                                            />

                                            {/* Label */}
                                            <text
                                                x={node.x}
                                                y={node.y - node.strength - 10}
                                                textAnchor="middle"
                                                className="text-[10px] font-black uppercase tracking-widest fill-muted-foreground select-none opacity-40 group-hover/node:opacity-100 group-hover/node:fill-primary transition-all"
                                            >
                                                {node.label}
                                            </text>
                                        </g>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-[10px] p-0 overflow-hidden rounded-2xl border-primary/20 shadow-2xl">
                                        <div className="p-3 bg-card border-b border-border/40 font-black uppercase tracking-[0.2em] text-primary">
                                            {node.label}
                                        </div>
                                        <div className="p-3 space-y-1.5 font-medium">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-muted-foreground">Recall Strength</span>
                                                <span className="font-black text-foreground">{node.strength * 10}%</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-muted-foreground">Status</span>
                                                <span className={cn(
                                                    "uppercase tracking-tighter font-black",
                                                    node.status === "stable" ? "text-green-500" : "text-amber-500"
                                                )}>{node.status}</span>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </svg>
                    </TooltipProvider>

                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.03)_1.5px,transparent_1.5px)] bg-[length:24px_24px] pointer-events-none" />
                </div>

                {selectedNode ? (
                    <div className="px-8 pb-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 rounded-[24px] bg-primary/[0.03] border border-primary/10 flex items-center justify-between group/info">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/info:scale-110 transition-transform">
                                    <Brain size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-black uppercase tracking-tight leading-none">{nodes.find(n => n.id === selectedNode)?.label}</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Node Synced & Optimized</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-xl hover:bg-primary/5"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="px-8 pb-8">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">
                            <Info size={10} />
                            Click a node to explore connection clusters
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

