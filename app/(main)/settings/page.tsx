"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import { Check, Settings, Sparkles, Activity, ShieldCheck, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const accentColors = [
    { name: "Blue", value: "cyan" as const, hex: "#3b82f6", desc: "Core Protocol Blue" },
    { name: "Emerald", value: "green" as const, hex: "#10b981", desc: "Organic Growth Green" },
    { name: "Violet", value: "purple" as const, hex: "#8b5cf6", desc: "Neural Pathway Purple" },
    { name: "Rose", value: "pink" as const, hex: "#f43f5e", desc: "Synaptic Rose" },
    { name: "Amber", value: "yellow" as const, hex: "#f59e0b", desc: "Intellect Amber" },
];

export default function SettingsPage() {
    const { color, setColor } = useTheme();

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                    <Settings size={12} />
                    System Configuration
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Workspace <span className="text-primary italic">Settings</span>
                </h1>
                <p className="text-muted-foreground font-medium">Customize your neural environment and interface preferences.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-12">
                {/* Theme Customization */}
                <div className="lg:col-span-8 space-y-10">
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
                </div>

                {/* Info & Meta */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-border/40" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground shrink-0">Core Status</h2>
                            <div className="h-px flex-1 bg-border/40" />
                        </div>

                        <Card className="rounded-[32px] border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Cpu size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Core Version</span>
                                        <span className="text-xs font-black text-foreground">v4.5.12-PRO</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                                        <Activity size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Neural Sync</span>
                                        <span className="text-xs font-black text-green-600">OPTIMAL</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Encryption</span>
                                        <span className="text-xs font-black text-foreground">AES-256 BIT</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/40 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest">
                                    <Sparkles size={10} />
                                    Synced across 3 devices
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

