import { Bell } from "lucide-react";

export function TopBar() {
    return (
        <header className="flex h-16 w-full items-center justify-between border-b border-white/5 glass sticky top-0 z-40 px-8">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-black tracking-[0.3em] text-muted-foreground/50">Active Protocol</span>
                    <span className="text-sm font-bold tracking-tight text-foreground transition-all">NEURAL_RETRIEVAL_MODE</span>
                </div>
            </div>

            <div className="flex items-center gap-8">
                {/* Minimal Progress Indicator */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">Goal</span>
                        <span className="text-xs font-bold text-primary">3,200 EXP</span>
                    </div>
                    <div className="h-1.5 w-32 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full w-2/3 bg-primary rounded-full transition-all shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                    </div>
                </div>

                <div className="flex items-center gap-4 border-l border-white/5 pl-8">
                    <button className="rounded-full p-2.5 hover:bg-white/5 text-muted-foreground hover:text-primary transition-all relative">
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-primary rounded-full" />
                    </button>

                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shadow-lg ring-1 ring-white/10">
                        KS
                    </div>
                </div>
            </div>
        </header>
    );
}
