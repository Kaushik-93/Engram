"use client";

import React from "react";
import { Canvas } from "@/components/recall/Canvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Timer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BrainDumpPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <header className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-md">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-sm">
                    <Timer className="h-4 w-4 animate-pulse" />
                    <span>01:59</span>
                </div>

                <Button variant="default" size="sm">
                    Submit Recall
                </Button>
            </header>

            <main className="flex-1">
                <Canvas />
            </main>
        </div>
    );
}
