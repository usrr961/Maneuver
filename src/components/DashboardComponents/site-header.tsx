import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const PAGE_TITLES: Record<string, string> = {
    "/": "Home",
    "/scout": "Scout",
    "/settings": "Settings",
    "/match-data": "Load Match Data",
    "/clear-data": "Clear Data",
    "/parse-data": "Parse Data",
    "/game-start": "Game Start",
    "/qr-transfer": "QR Data Transfer",
    "/json-transfer": "JSON Data Transfer",
    "/match-strategy": "Match Strategy",
    "/auto-start": "Auto Start",
    "/auto-scoring": "Auto",
    "/teleop-scoring": "Teleop",
    "/endgame": "Endgame",
  // Add more routes as needed
};

export function SiteHeader() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "Page";
  return (
    <header className="flex h-(--header-height)items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)  py-2">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" size={"lg"} />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-12"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
