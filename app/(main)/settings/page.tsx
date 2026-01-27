"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { SystemStatus } from "@/components/settings/SystemStatus";

export default function SettingsPage() {
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
                    <Settings size={12} />
                    System Configuration
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Workspace <span className="text-primary italic">Settings</span>
                </h1>
                <p className="text-muted-foreground font-medium">Customize your neural environment and interface preferences.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-12">
                {/* Theme Customization */}
                <div className="lg:col-span-8 space-y-10">
                    <ThemeSelector />
                </div>

                {/* Info & Meta */}
                <div className="lg:col-span-4 space-y-10">
                    <SystemStatus />
                </div>
            </div>
        </div>
    );
}
