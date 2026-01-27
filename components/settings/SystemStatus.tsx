"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Cpu, Activity, ShieldCheck, Sparkles } from "lucide-react";

export function SystemStatus() {
    return (
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
    );
}
