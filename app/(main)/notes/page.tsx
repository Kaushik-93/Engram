"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotesPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">

            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Your Engrams</h1>
                    <p className="text-muted-foreground"> {86} concepts secured.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Search concepts..."
                            className="w-full h-10 pl-9 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <Button className="gap-2">
                        <Plus size={16} /> New Note
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Note Item 1 - Healthy */}
                <NoteItem
                    question="What is the difference between working memory and long-term memory?"
                    answer="Working memory is temporary and limited in capacity (cognitive load), whereas long-term memory is theoretically unlimited and stores information permanently as schemas."
                    source="Cognitive Load Theory, p.12"
                    status="healthy"
                />

                {/* Note Item 2 - Too Long */}
                <NoteItem
                    question="Explain the process of synaptic transmission."
                    answer="Synaptic transmission begins when an action potential reaches the axon terminal. This causes voltage-gated calcium channels to open, allowing calcium ions to enter. The influx of calcium causes synaptic vesicles to fuse with the presynaptic membrane, releasing neurotransmitters into the synaptic cleft. These neurotransmitters diffuse across the cleft and bind to specific receptors on the postsynaptic membrane. This binding causes ion channels to open or close, leading to a change in the membrane potential of the postsynaptic neuron. The neurotransmitters are then cleared from the cleft by reuptake or enzymatic degradation."
                    source="Neuroscience 101"
                    status="warning"
                />

                {/* Note Item 3 */}
                <NoteItem
                    question="What is the spacing effect?"
                    answer="The phenomenon where learning is greater when studying is spread out over time, as opposed to studying the same amount of content in a single session."
                    source="Make It Stick"
                    status="healthy"
                />

                {/* Note Item 4 */}
                <NoteItem
                    question="Define 'Chunking' in the context of learning."
                    answer="Chunking is the process of binding individual pieces of information into a meaningful whole (a chunk). This bypasses the limits of working memory."
                    source="Learning How to Learn"
                    status="healthy"
                />
            </div>
        </div>
    );
}

function NoteItem({ question, answer, source, status }: { question: string, answer: string, source: string, status: "healthy" | "warning" }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Card className={cn(
            "overflow-hidden transition-all duration-300 border hover:border-primary/30",
            isOpen ? "bg-card shadow-md" : "bg-card/50 shadow-sm"
        )}>
            <div
                className="p-4 flex items-start gap-4 cursor-pointer select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <button className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg leading-snug">{question}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{source}</span>
                        {status === "warning" && isOpen && (
                            <span className="flex items-center gap-1 text-orange-500 font-medium">
                                <AlertCircle size={12} /> Consider simplifying
                            </span>
                        )}
                        {status === "healthy" && isOpen && (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle2 size={12} /> Optimal length
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 pl-12 pr-8 pb-6">
                        <p className={cn(
                            "leading-relaxed",
                            status === "warning" ? "text-muted-foreground/90" : "text-foreground/90"
                        )}>
                            {answer}
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Button variant="ghost" size="sm" className="h-8 text-xs">Edit</Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs">Convert to Flashcard</Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
