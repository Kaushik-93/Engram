"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Move, ArrowRight, Ghost } from "lucide-react";
import { cn } from "@/lib/utils";

interface Node {
    id: string;
    text: string;
    x: number;
    y: number;
    type: "user" | "ghost"; // Ghost nodes are AI suggestions
}

interface Edge {
    from: string;
    to: string;
}

export function Canvas() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [newNodeText, setNewNodeText] = useState("");
    const [isDragging, setIsDragging] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const addNode = () => {
        if (!newNodeText.trim()) return;

        const newNode: Node = {
            id: crypto.randomUUID(),
            text: newNodeText,
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50,
            type: "user",
        };

        setNodes([...nodes, newNode]);
        setNewNodeText("");
    };

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setIsDragging(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setNodes(nodes.map(n => n.id === isDragging ? { ...n, x, y } : n));
    };

    const handleMouseUp = () => {
        setIsDragging(null);
    };

    // Simulate AI "Ghost Text" injection after some time
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            // Mock AI finding a missing concept
            if (nodes.length > 0 && !nodes.some(n => n.type === "ghost")) {
                const ghostNode: Node = {
                    id: "ghost-1",
                    text: "Missing: Central Dogma",
                    x: 300,
                    y: 100,
                    type: "ghost"
                };
                setNodes(prev => [...prev, ghostNode]);
            }
        }, 8000);
        return () => clearTimeout(timeout);
    }, [nodes.length]);

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex gap-2 bg-card/80 backdrop-blur-md p-2 rounded-xl border border-border/50 shadow-lg">
                <Input
                    value={newNodeText}
                    onChange={(e) => setNewNodeText(e.target.value)}
                    placeholder="Add concept..."
                    className="w-48 h-9 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && addNode()}
                />
                <Button size="sm" onClick={addNode}>
                    <Plus size={16} />
                </Button>
            </div>

            <div
                ref={containerRef}
                className="flex-1 relative cursor-crosshair bg-[radial-gradient(circle_at_center,rgba(var(--foreground-rgb),0.1)_1px,transparent_1px)] bg-[length:20px_20px]"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Connections (Simple SVG lines) */}
                <svg className="absolute inset-0 pointer-events-none opacity-50">
                    {edges.map((edge, i) => {
                        const start = nodes.find(n => n.id === edge.from);
                        const end = nodes.find(n => n.id === edge.to);
                        if (!start || !end) return null;

                        return (
                            <line
                                key={i}
                                x1={start.x} y1={start.y}
                                x2={end.x} y2={end.y}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {nodes.map(node => (
                    <div
                        key={node.id}
                        onMouseDown={(e) => handleMouseDown(e, node.id)}
                        className={cn(
                            "absolute px-4 py-2 rounded-xl border shadow-lg cursor-grab active:cursor-grabbing flex items-center gap-2 transition-all duration-300",
                            node.type === "user"
                                ? "bg-card border-primary/20 hover:border-primary text-foreground"
                                : "bg-transparent border-dashed border-muted-foreground/50 text-muted-foreground opacity-70 hover:opacity-100"
                        )}
                        style={{
                            left: node.x,
                            top: node.y,
                            transform: "translate(-50%, -50%)"
                        }}
                    >
                        {node.type === "ghost" && <Ghost size={14} className="animate-pulse" />}
                        <span className="font-bold text-sm tracking-tight">{node.text}</span>
                        {node.type === "user" && (
                            <div className="w-2 h-2 rounded-full bg-primary absolute -right-1 -top-1" />
                        )}
                    </div>
                ))}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em] bg-background/50 px-4 py-1 rounded-full backdrop-blur-sm">
                    Brain Dump Mode: Active
                </p>
            </div>
        </div>
    );
}
