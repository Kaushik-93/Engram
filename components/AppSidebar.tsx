"use client"

import * as React from "react"
import {
    Activity,
    BarChart2,
    BookOpen,
    Brain,
    Command,
    Database,
    FileText,
    Folder,
    HelpCircle,
    LayoutDashboard,
    Library,
    MoreHorizontal,
    PieChart,
    Plus,
    Search,
    Settings,
    Users,
} from "lucide-react"

import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Need to install avatar

const data = {
    navMain: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Library", href: "/library", icon: Library },
    { name: "Recall", href: "/recall", icon: Brain },
    { name: "Notes", href: "/notes", icon: FileText }],

    footer: [
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: HelpCircle,
        },

    ],
}

export function AppSidebar() {
    const pathname = usePathname()
    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader className="flex h-16 px-4">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="py-1 group-data-[state=collapsed]:w-8">
                        <Brain className="size-4 text-primary" />
                    </div>
                    <h2 className="text-xl font-black tracking-tighter text-foreground group-data-[collapsible=icon]:hidden ">
                        Engram<span className="text-primary tracking-normal">.</span>
                    </h2>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent className="">

                        <SidebarMenu>
                            {data.navMain.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild isActive={item.href === pathname} tooltip={item.name} className="h-10 rounded-lg">
                                        <a href={item.href}>
                                            <item.icon className="size-4" />
                                            <span>{item.name}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-2">
                <SidebarMenu>
                    {data.footer.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title} className="h-10 rounded-lg">
                                <a href={item.url}>
                                    <item.icon className="size-4" />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                <SidebarSeparator className="my-2 bg-border/50" />
                <div className="flex items-center gap-3 px-2 py-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="#" alt="KS" />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">KS</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-xs text-foreground">Kaushik S.</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">kaushik@example.com</span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
