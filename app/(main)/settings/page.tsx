"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const accentColors = [
    { name: "Blue", value: "cyan" as const, hex: "#3b82f6", desc: "Primary Blue" },
    { name: "Emerald", value: "green" as const, hex: "#10b981", desc: "Fresh Green" },
    { name: "Violet", value: "purple" as const, hex: "#8b5cf6", desc: "Soft Purple" },
    { name: "Rose", value: "pink" as const, hex: "#f43f5e", desc: "Warm Rose" },
    { name: "Amber", value: "yellow" as const, hex: "#f59e0b", desc: "Golden Amber" },
];

export default function SettingsPage() {
    const { color, setColor } = useTheme();

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-up">
            <div className="pb-8 border-b border-border">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                    <span className="text-primary">Settings</span>
                </h1>
                <p className="text-muted-foreground mt-3 text-base">
                    Customize your experience.
                </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-12">
                {/* Theme Customization */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Accent Color</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accentColors.map((accentColor) => (
                                <button
                                    key={accentColor.value}
                                    onClick={() => setColor(accentColor.value)}
                                    className={cn(
                                        "group relative p-6 rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col items-center text-center",
                                        color === accentColor.value
                                            ? "border-primary bg-accent"
                                            : "border-border bg-card hover:border-primary/50"
                                    )}
                                >
                                    <div
                                        className="w-16 h-16 rounded-xl mb-4 transition-all duration-300 group-hover:scale-105"
                                        style={{
                                            backgroundColor: accentColor.hex,
                                        }}
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-foreground mb-1">{accentColor.name}</p>
                                        <p className="text-xs text-muted-foreground">{accentColor.desc}</p>
                                    </div>
                                    {color === accentColor.value && (
                                        <div className="absolute top-3 right-3 text-primary">
                                            <Check size={16} strokeWidth={3} />
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
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">System Status</h2>
                        <Card className="p-0 border border-border">
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-muted-foreground">Core Version</span>
                                        <span className="font-black text-primary">v4.5.12-PRO</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-muted-foreground">Neural Sync</span>
                                        <span className="font-black text-green-500">OPTIMAL</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-muted-foreground">Encryption</span>
                                        <span className="font-black text-foreground">AES-256</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border">
                                    <p className="text-xs leading-relaxed text-muted-foreground text-center">
                                        Theme preferences are synced across your devices.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
