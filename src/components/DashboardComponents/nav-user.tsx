import { useState } from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronsUpDown } from "lucide-react"
import { useScouterManagement } from "@/hooks/useScouterManagement"
import { ScouterDisplay } from "./ScouterDisplay"
import { ScouterSelectorContent } from "./ScouterSelectorContent"

export function NavUser() {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useState(false)
  
  const {
    currentScouter,
    currentScouterStakes,
    scoutersList,
    saveScouter,
    removeScouter
  } = useScouterManagement()

  const handleClose = () => setOpen(false)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Use Modal on mobile, Popover on desktop */}
        {isMobile ? (
          <>
            <SidebarMenuButton
              size="lg"
              onClick={() => setOpen(true)}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <ScouterDisplay 
                currentScouter={currentScouter}
                currentScouterStakes={currentScouterStakes}
              />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="w-[90vw] max-w-md p-0 top-[30%] translate-y-[-30%] sm:top-[50%] sm:translate-y-[-50%]">
                <DialogHeader className="p-4 pb-0">
                  <DialogTitle>Select Scouter</DialogTitle>
                </DialogHeader>
                <div className="p-0">
                  <ScouterSelectorContent
                    currentScouter={currentScouter}
                    scoutersList={scoutersList}
                    onScouterSelect={saveScouter}
                    onScouterRemove={removeScouter}
                    onClose={handleClose}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <ScouterDisplay 
                  currentScouter={currentScouter}
                  currentScouterStakes={currentScouterStakes}
                />
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[300px] p-0" 
              side="right"
              align="start"
            >
              <ScouterSelectorContent
                currentScouter={currentScouter}
                scoutersList={scoutersList}
                onScouterSelect={saveScouter}
                onScouterRemove={removeScouter}
                onClose={handleClose}
              />
            </PopoverContent>
          </Popover>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
