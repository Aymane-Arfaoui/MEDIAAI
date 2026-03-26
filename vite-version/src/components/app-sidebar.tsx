"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Mail,
  CheckSquare,
  Calendar,
  Settings,
  Database,
  FileText,
  Brain,
  BarChart3,
  Target,
  Sparkles,
  BookOpen,
  Film,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Kristina Subbotina",
    email: "kristina@lexsy.ai",
    avatar: "",
  },
  navGroups: [
    {
      label: "Creator Intelligence",
      items: [
        {
          title: "Overview",
          url: "/overview",
          icon: LayoutDashboard,
        },
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: BarChart3,
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: Brain,
        },
        {
          title: "Knowledge Base",
          url: "/knowledge",
          icon: BookOpen,
        },
      ],
    },
    {
      label: "Strategy & Planning",
      items: [
        {
          title: "Strategy",
          url: "/strategy",
          icon: Target,
        },
        {
          title: "Planner",
          url: "/planner",
          icon: Calendar,
        },
        {
          title: "AI Strategist",
          url: "/agent",
          icon: Sparkles,
        },
        {
          title: "Repurpose",
          url: "/repurpose",
          icon: Film,
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          title: "Settings",
          url: "/settings/account",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/overview">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles size={20} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MEDIAAI</span>
                  <span className="truncate text-xs">Creator Intelligence</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
