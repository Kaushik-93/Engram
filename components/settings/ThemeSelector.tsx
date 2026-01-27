"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const accentColors = [
    { name: "Blue", value: "cyan" as const, hex: "#3b82f6", desc: "Core Protocol Blue" },
    { name: "Emerald", value: "green" as const, hex: "#10b981", desc: "Organic Growth Green" },
    { name: "Violet", value: "purple" as const, hex: "#8b5cf6", desc: "Neural Pathway Purple" },
    { name: "Rose", value: "pink" as const, hex: "#f43f5e", desc: "Synaptic Rose" },
    { name: "Amber", value: "yellow" as const, hex: "#f59e0b", desc: "Intellect Amber" },
];

export function ThemeSelector() {
    const { color, setColor } = useTheme();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/40" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground shrink-0">Interface Aesthetics</h2>
                <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accentColors.map((accentColor) => (
                    <button
                        key={accentColor.value}
                        onClick={() => setColor(accentColor.value)}
                        className={cn(
                            "group relative p-6 rounded-[32px] border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex items-center gap-6 text-left overflow-hidden backdrop-blur-sm",
                            color === accentColor.value
                                ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/5"
                                : "border-border/60 bg-card/40 hover:border-primary/30"
                        )}
                    >
                        <div
                            className="w-14 h-14 rounded-2xl shrink-0 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                            style={{
                                backgroundColor: accentColor.hex,
                            }}
                        />
                        <div className="space-y-0.5">
                            <p className="font-black text-sm text-foreground uppercase tracking-wider">{accentColor.name}</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase">{accentColor.desc}</p>
                        </div>
                        {color === accentColor.value && (
                            <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                <Check size={14} strokeWidth={4} />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
