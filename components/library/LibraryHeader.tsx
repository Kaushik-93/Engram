"use client";

import * as React from "react";
import { BookOpen, Search, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LibraryHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
}

export function LibraryHeader({ searchQuery, setSearchQuery, onUpload, isUploading }: LibraryHeaderProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                    <BookOpen size={12} />
                    Library Management
                </div>
                <h1 className="text-4xl font-black tracking-tight">
                    Your <span className="text-primary italic">Collection</span>
                </h1>
                <p className="text-muted-foreground font-medium">
                    Manage your digital engrams and search across your knowledge base.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full md:w-80 group">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search your library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none text-sm font-medium"
                    />
                </div>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={onUpload}
                    className="hidden"
                    ref={fileInputRef}
                />
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-12 px-6 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2"
                >
                    {isUploading ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={18} />}
                    Import PDF
                </Button>
            </div>
        </div>
    );
}
