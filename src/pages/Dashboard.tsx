import { AppSidebar } from "@/components/DashboardComponents/app-sidebar"
import { SiteHeader } from "@/components/DashboardComponents/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { Outlet } from "react-router-dom"



export default function Dashboard() {
    return (
        <SidebarProvider
        style={
            {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
        }
        >
        <AppSidebar variant="inset" />
        <SidebarInset>
            <SiteHeader />
            <div className="pt-(--header-height)">
                <Outlet />
            </div>
        </SidebarInset>
        </SidebarProvider>
    )
}
