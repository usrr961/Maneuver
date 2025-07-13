import { Binoculars, ChevronRight, Download, Home, type LucideIcon } from "lucide-react"

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "../mode-toggle"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {

    const handlePlayerStationChange = (value : string) => {
    const selectedStation = value;
    localStorage.setItem("playerStation", selectedStation);
    };

    const navigate = useNavigate();

  // navigate to the destination page
    const proceedClick = (url?: string) => {
        if (url) {
        // If a destination is provided, navigate to that page
        navigate(url);
        } else {
        // If no destination is provided, navigate to the root page
        navigate("/");
        }
    };

    useEffect(() => {
    const savedPlayerStation = localStorage.getItem("playerStation");
    if (savedPlayerStation) {
        const element = document.getElementById(savedPlayerStation.toLowerCase().replace(" ", ""));
        if (element) {
        (element as HTMLInputElement).checked = true;
        }
    }
    }, []);

  return (
     <SidebarGroup>
      <SidebarMenuItem className="flex items-center gap-2">
            <div className="flex gap-2">
                <Select
                    onValueChange={handlePlayerStationChange}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="red-1">Red 1</SelectItem>
                        <SelectItem value="red-2">Red 2</SelectItem>
                        <SelectItem value="red-3">Red 3</SelectItem>
                        <SelectItem value="blue-1">Blue 1</SelectItem>
                        <SelectItem value="blue-2">Blue 2</SelectItem>
                        <SelectItem value="blue-3">Blue 3</SelectItem>
                    </SelectContent>
                </Select>
                <ModeToggle/>
            </div>
      </SidebarMenuItem>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton tooltip={"Home"} onClick={() => proceedClick("/")}>
            <Home />
            <span>Home</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton tooltip={"Scout"} onClick={() => proceedClick("/")}>
            <Binoculars />
            <span>Scout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton tooltip={"Dump Data"} onClick={() => proceedClick("/")}>
            <Download />
            <span>Dump Data</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}