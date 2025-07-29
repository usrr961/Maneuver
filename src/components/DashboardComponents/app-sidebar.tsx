import * as React from "react"
import { Settings, SquarePen, Download } from "lucide-react"

// import { NavDocuments } from "@/components/DashboardComponents/nav-documents"
import { NavMain } from "@/components/DashboardComponents/nav-main"
// import { NavSecondary } from "@/components/DashboardComponents/nav-secondary"
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
import ManeuverHorizontalLogo from "../../assets/Maneuver Wordmark Horizontal.png"

const data = {
  navMain: [
    {
      title: "Data Actions",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Clear Data",
          url: "/clear-data",
        },
        {
          title: "Convert Scouting JSON Data",
          url: "/parse-data",
        }
      ]
    },
    {
      title: "Data Transfer",
      url: "#",
      icon: Download,
      items: [
        {
          title: "Scouting Data JSON Transfer",
          url: "/json-transfer",
        },
        {
          title: "Scouting Data QR Transfer",
          url: "/scout-data-qr",
        },
        {
          title: "Match Data API/JSON Load",
          url: "/match-data",
        },
        {
          title: "Match Data QR Transfer",
          url: "/match-data-qr",
        }
      ]
    },
    {
      title: "Strategy",
      url: "#",
      icon: SquarePen,
      items: [
        {
          title: "Match Strategy",
          url: "/match-strategy",
        },
        {
          title: "Team Stats",
          url: "/team-stats",
        },
        {
          title: "Pick Lists",
          url: "/pick-list",
        }
      ],
    },
  ],
  navSecondary: [
    {
      title: "Get Help (WIP)",
      url: "#",
      // icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Saved Match Strategies (WIP)",
      url: "#",
      // icon: IconDatabase,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button] h-fit"
            >
              <a href="/">
                <img
                  src={ManeuverHorizontalLogo}
                  className="row-span-4 scale-75 dark:invert"
                />
              </a>
            </SidebarMenuButton>
            <Separator className="my-1" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
