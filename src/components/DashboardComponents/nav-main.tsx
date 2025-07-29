import { Binoculars, ChevronRight, Home, type LucideIcon } from "lucide-react"

import { useEffect, useState } from "react";
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
  useSidebar,
} from "@/components/ui/sidebar"
import { ModeToggle } from "../mode-toggle"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { convertTeamRole } from "@/lib/utils";


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

    const [selected, setSelected] = useState<string | null>(localStorage.getItem("playerStation"));

    const handlePlayerStationChange = (value : string) => {
      setSelected(value);
      localStorage.setItem("playerStation", value);
    };

    const navigate = useNavigate();
    const { isMobile, setOpenMobile } = useSidebar();

    // navigate to the destination page
    const proceedClick = (url?: string) => {
        // Close sidebar on mobile after navigation
        if (isMobile) {
            setOpenMobile(false);
        }
        
        if (url) {
        // If a destination is provided, navigate to that page
        navigate(url);
        } else {
        // If no destination is provided, navigate to the root page
        navigate("/");
        }
    };

    // Handler for sub-menu clicks
    const handleSubItemClick = (url: string) => {
        // Close sidebar on mobile after navigation
        if (isMobile) {
            setOpenMobile(false);
        }
        navigate(url);
    };

    useEffect(() => {
      if (selected) {
          const element = document.getElementById(selected.toLowerCase().replace(" ", ""));
          if (element) {
          (element as HTMLInputElement).checked = true;
          }
      }
    }, [selected]);

  return (
    <SidebarGroup>
      <SidebarMenuItem className="flex items-center pb-4">
            <div className="flex w-full gap-2">
                <Select
                    onValueChange={handlePlayerStationChange}
                >
                    <SelectTrigger className="w-full text-lg font-bold">
                        <SelectValue placeholder={convertTeamRole(selected) || "Role"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem className="text-lg" value="lead">Lead</SelectItem>
                        <SelectItem className="text-lg" value="red-1">Red 1</SelectItem>
                        <SelectItem className="text-lg" value="red-2">Red 2</SelectItem>
                        <SelectItem className="text-lg" value="red-3">Red 3</SelectItem>
                        <SelectItem className="text-lg" value="blue-1">Blue 1</SelectItem>
                        <SelectItem className="text-lg" value="blue-2">Blue 2</SelectItem>
                        <SelectItem className="text-lg" value="blue-3">Blue 3</SelectItem>
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
          <SidebarMenuButton tooltip={"Scout"} onClick={() => proceedClick("/game-start")}>
            <Binoculars />
            <span>Scout</span>
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
                        <button onClick={() => handleSubItemClick(subItem.url)}>
                          <span>{subItem.title}</span>
                        </button>
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