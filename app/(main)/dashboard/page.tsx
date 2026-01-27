"use client"

import * as React from "react"
import { ReadyToRecall } from "@/components/dashboard/ReadyToRecall"
import { ConsistencyChart } from "@/components/dashboard/ConsistencyChart"

import { QuickActions } from "@/components/dashboard/QuickActions"
import { SessionSummary } from "@/components/dashboard/SessionSummary"

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-10 p-8 pt-6 animate-in fade-in duration-700 max-w-7xl mx-auto">
            {/* Top Section: Ready to Recall & Consistency */}
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ReadyToRecall />
                </div>
                <div className="lg:col-span-1">
                    <ConsistencyChart />
                </div>
            </div>



            {/* Bottom Sections: Quick Actions & Session Summary */}
            <div className="space-y-8">
                <QuickActions />
                <SessionSummary />
            </div>
        </div>
    )
}
