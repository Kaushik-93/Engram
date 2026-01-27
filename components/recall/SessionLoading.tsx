"use client";

import * as React from "react";
import { Brain } from "lucide-react";

export function SessionLoading() {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="relative">
                <div className="h-24 w-24 rounded-[32px] bg-primary/10 flex items-center justify-center animate-pulse">
                    <Brain size={48} className="text-primary" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-xl font-black uppercase tracking-widest">Synthesizing Session</h2>
                <p className="text-sm text-muted-foreground font-medium italic">
                    Our AI is connecting your notes and cards into a custom recall path...
                </p>
            </div>
        </div>
    );
}
