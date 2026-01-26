"use client"

import * as React from "react"

export function SessionSummary() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 py-6 border-t border-border/40">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Completed</span>
                    <span className="text-sm font-bold">12 recalls</span>
                </div>
                <div className="h-6 w-px bg-border/40 hidden md:block" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Pending</span>
                    <span className="text-sm font-bold">5 recalls</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
                <span>Last session:</span>
                <span className="text-foreground">Today, 2:45 PM</span>
            </div>
        </div>
    )
}
