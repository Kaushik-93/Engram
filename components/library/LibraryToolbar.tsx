"use client";

import * as React from "react";
import { Heart, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export type FilterStatus = "all" | "favorites" | "new" | "in-progress" | "completed";
export type SortOption = "recent" | "title" | "progress";

interface LibraryToolbarProps {
    filterStatus: FilterStatus;
    setFilterStatus: (status: FilterStatus) => void;
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
}

export function LibraryToolbar({ filterStatus, setFilterStatus, sortBy, setSortBy }: LibraryToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-2 rounded-[24px] bg-muted/30 border border-border/40">
            <div className="flex p-1 bg-background/50 rounded-2xl border border-border/40 gap-1 overflow-x-auto no-scrollbar">
                {(["all", "favorites", "new", "in-progress", "completed"] as FilterStatus[]).map((status) => (
                    <TooltipProvider key={status}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={filterStatus === status ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "rounded-xl px-4 py-1.5 h-9 text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                                        filterStatus === status ? "bg-card shadow-sm text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {status === "favorites" ? (
                                        <Heart size={14} className={cn(filterStatus === status && "fill-primary")} />
                                    ) : (
                                        status.replace("-", " ")
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold uppercase text-[10px] tracking-widest">Filter: {status}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>

            <div className="flex items-center gap-2 pr-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2 shrink-0">
                    Sort by
                </span>
                <div className="flex p-1 bg-background/50 rounded-2xl border border-border/40 gap-1">
                    {(["recent", "title", "progress"] as SortOption[]).map((option) => (
                        <TooltipProvider key={option}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={sortBy === option ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setSortBy(option)}
                                        className={cn(
                                            "rounded-xl p-1 h-9 w-9 transition-all",
                                            sortBy === option ? "bg-card shadow-sm text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {option === "recent" && <Clock size={16} />}
                                        {option === "title" && <span className="font-black text-[10px] uppercase">Az</span>}
                                        {option === "progress" && <Activity size={16} />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold uppercase text-[10px] tracking-widest">Sort: {option}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </div>
        </div>
    );
}
