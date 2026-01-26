"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    Brain,
    FileText,
    Library,
    ChevronLeft,
    ChevronRight,
    Settings,
    LogOut,
} from "lucide-react";

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const pathname = usePathname();

    const navItems = [
        { name: "Today", href: "/dashboard", icon: LayoutDashboard },
        { name: "Read", href: "/read", icon: BookOpen },
        { name: "Recall", href: "/recall", icon: Brain },
        { name: "Notes", href: "/notes", icon: FileText },
        { name: "Library", href: "/library", icon: Library },
    ];

    return (
        <aside
            className={cn(
                "relative flex flex-col border-r border-white/5 glass transition-all duration-500 ease-in-out h-screen z-50",
                isCollapsed ? "w-20" : "w-72"
            )}
        >
            <div className="flex h-16 items-center justify-between px-6 mt-4">
                {!isCollapsed && (
                    <span className="text-2xl font-black tracking-tighter text-foreground leading-none">
                        ENGRAM<span className="text-primary tracking-normal">.</span>
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-full p-2 hover:bg-white/5 text-muted-foreground transition-all"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <div className="flex-1 py-10 space-y-1.5 px-4 mt-4">
                <p className={cn("text-[10px] font-black tracking-[0.25em] text-muted-foreground mb-4 ml-4 uppercase transition-opacity", isCollapsed && "opacity-0")}>Neural Net</p>
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 group relative",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]"
                                    : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                            )}
                        >
                            {isActive && <div className="absolute left-0 w-1 h-4 bg-primary rounded-full" />}
                            <item.icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn("shrink-0 transition-all", isActive ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" : "text-muted-foreground group-hover:text-foreground")}
                            />
                            {!isCollapsed && (
                                <span className={cn("ml-4 text-sm font-bold tracking-tight transition-all", isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100")}>{item.name}</span>
                            )}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 space-y-1 mb-6">
                <Link href="/settings" className="flex w-full items-center rounded-2xl px-4 py-3.5 text-muted-foreground hover:bg-white/[0.03] hover:text-primary transition-all group">
                    <Settings size={20} className="shrink-0 group-hover:rotate-45 transition-transform duration-500" />
                    {!isCollapsed && <span className="ml-4 text-sm font-bold tracking-tight">System</span>}
                </Link>
                <Link href="/login" className="flex w-full items-center rounded-2xl px-4 py-3.5 text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all group">
                    <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
                    {!isCollapsed && <span className="ml-4 text-sm font-bold tracking-tight">Disconnect</span>}
                </Link>
            </div>
        </aside>
    );
}
