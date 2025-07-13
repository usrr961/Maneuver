import * as React from "react"
import { Settings, SquarePen } from "lucide-react"

import { NavDocuments } from "@/components/DashboardComponents/nav-documents"
import { NavMain } from "@/components/DashboardComponents/nav-main"
import { NavSecondary } from "@/components/DashboardComponents/nav-secondary"
import { NavUser } from "@/components/DashboardComponents/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "../ui/separator"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Data Actions",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Scan Match Data QR Code",
          url: "/match-data/online",
        },
        {
          title: "Upload Match Data File",
          url: "/match-data/offline",
        },
        {
          title: "Clear Data",
          url: "/clear-data",
        },
        {
          title: "Parse Data",
          url: "/parse-data",
        }
      ]
    },
    {
      title: "Match Strategy",
      url: "#",
      icon: SquarePen,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      // icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      // icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      // icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      // icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      // icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      // icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      // icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      // icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      // icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 my-4"
            >
              <a href="#">
                {/* <IconInnerShadowTop className="!size-5" /> */}
                <span className="text-3xl text-primary font-semibold">Jockey</span>
              </a>
            </SidebarMenuButton>
            <Separator className="my-1" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
