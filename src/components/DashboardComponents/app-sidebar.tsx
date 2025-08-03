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
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "../ui/separator"
import ManeuverHorizontalLogo from "../../assets/Maneuver Wordmark Horizontal.png"
import { haptics } from "@/lib/haptics"

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
  const { setOpenMobile } = useSidebar()
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null)
  const touchEndRef = React.useRef<{ x: number; y: number } | null>(null)
  const lastTouchRef = React.useRef<{ x: number; y: number; time: number } | null>(null)
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  const isDraggingRef = React.useRef(false)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    isDraggingRef.current = false
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !sidebarRef.current) return
    
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const currentTime = Date.now()
    
    touchEndRef.current = { x: currentX, y: currentY }
    lastTouchRef.current = { x: currentX, y: currentY, time: currentTime }

    const deltaX = currentX - touchStartRef.current.x
    const deltaY = currentY - touchStartRef.current.y
    
    // Only drag horizontally and only in the close direction (left)
    if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
      const maxDrag = window.innerWidth * 0.8 // 80% of viewport width
      const transform = `translateX(${Math.max(deltaX, -maxDrag)}px)`
      
      sidebarRef.current.style.transform = transform
      sidebarRef.current.style.transition = 'none'
      isDraggingRef.current = true
    }
  }
  
  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current || !sidebarRef.current) return
    
    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const dismissThreshold = 100 // Need to drag 100px to dismiss
    const dragThreshold = 20 // Minimum drag to register as dragging
    const velocityThreshold = 1.0 // Velocity threshold for quick flicks
    const counterVelocityThreshold = 0.8 // Threshold for detecting counter-movement
    
    let shouldClose = false
    let wasDragging = false
    
    // Calculate velocity if we have recent touch data
    let velocity = 0
    let hasRecentTouch = false
    
    if (lastTouchRef.current && touchEndRef.current) {
      const timeDiff = Date.now() - lastTouchRef.current.time
      if (timeDiff > 0 && timeDiff < 150) {
        hasRecentTouch = true
        // For sidebar closing, negative deltaX is dismiss direction (swipe left)
        velocity = (lastTouchRef.current.x - touchEndRef.current.x) / timeDiff
      }
    }
    
    // Only consider horizontal swipes for sidebar
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      wasDragging = deltaX < -dragThreshold // Dragged left
      
      // Only dismiss if:
      // - Dragged far enough left AND not flicking back right strongly
      // - OR quick leftward flick regardless of distance
      shouldClose = (deltaX < -dismissThreshold && (!hasRecentTouch || velocity >= -counterVelocityThreshold)) || 
                    (hasRecentTouch && velocity > velocityThreshold)
    }
    
    // Re-enable transition for snap-back animation
    sidebarRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
    
    if (shouldClose) {
      haptics.light()
      setOpenMobile(false)
    } else if (wasDragging) {
      // Snap back to original position - animate to translateX(0) first
      sidebarRef.current.style.transform = 'translateX(0)'
      haptics.vibrate(25) // Light haptic for snap-back
      
      // Remove transform entirely after animation completes
      setTimeout(() => {
        if (sidebarRef.current) {
          sidebarRef.current.style.transform = ''
          sidebarRef.current.style.transition = ''
        }
      }, 300)
    } else {
      // If not dragging, still reset transform and transition
      sidebarRef.current.style.transform = ''
      sidebarRef.current.style.transition = ''
    }
    
    // Reset touch references
    touchStartRef.current = null
    touchEndRef.current = null
    lastTouchRef.current = null
    isDraggingRef.current = false
  }

  React.useEffect(() => {
    const handleGlobalTouchStart = (e: TouchEvent) => {
      const sidebar = document.querySelector('[data-sidebar="sidebar"]')
      if (sidebar && !sidebar.contains(e.target as Node)) {
        const touch = e.touches[0]
        touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      }
    }

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || !sidebarRef.current) return
      
      const sidebar = document.querySelector('[data-sidebar="sidebar"]')
      if (sidebar && !sidebar.contains(e.target as Node)) {
        const currentX = e.touches[0].clientX
        const currentY = e.touches[0].clientY
        const currentTime = Date.now()
        
        touchEndRef.current = { x: currentX, y: currentY }
        lastTouchRef.current = { x: currentX, y: currentY, time: currentTime }

        const deltaX = currentX - touchStartRef.current.x
        const deltaY = currentY - touchStartRef.current.y
        
        // Only drag horizontally and only in the close direction (left)
        if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
          const maxDrag = window.innerWidth * 0.8 // 80% of viewport width
          const transform = `translateX(${Math.max(deltaX, -maxDrag)}px)`
          
          sidebarRef.current.style.transform = transform
          sidebarRef.current.style.transition = 'none'
          isDraggingRef.current = true
        }
      }
    }

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return
      
      const sidebar = document.querySelector('[data-sidebar="sidebar"]')
      if (sidebar && !sidebar.contains(e.target as Node)) {
        // Use the same logic as the component touch handler
        if (touchEndRef.current && sidebarRef.current) {
          const deltaX = touchEndRef.current.x - touchStartRef.current.x
          const deltaY = touchEndRef.current.y - touchStartRef.current.y
          const dismissThreshold = 100
          const dragThreshold = 20
          const velocityThreshold = 1.0
          const counterVelocityThreshold = 0.8
          
          let shouldClose = false
          let wasDragging = false
          
          // Calculate velocity if we have recent touch data
          let velocity = 0
          let hasRecentTouch = false
          
          if (lastTouchRef.current && touchEndRef.current) {
            const timeDiff = Date.now() - lastTouchRef.current.time
            if (timeDiff > 0 && timeDiff < 150) {
              hasRecentTouch = true
              velocity = (lastTouchRef.current.x - touchEndRef.current.x) / timeDiff
            }
          }
          
          // Only consider horizontal swipes for sidebar
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            wasDragging = deltaX < -dragThreshold
            shouldClose = (deltaX < -dismissThreshold && (!hasRecentTouch || velocity >= -counterVelocityThreshold)) || 
                          (hasRecentTouch && velocity > velocityThreshold)
          }
          
          // Re-enable transition for snap-back animation
          sidebarRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
          
          if (shouldClose) {
            e.preventDefault()
            haptics.light()
            setOpenMobile(false)
          } else if (wasDragging) {
            // Snap back to original position - animate to translateX(0) first
            sidebarRef.current.style.transform = 'translateX(0)'
            haptics.vibrate(25)
            
            // Remove transform entirely after animation completes
            setTimeout(() => {
              if (sidebarRef.current) {
                sidebarRef.current.style.transform = ''
                sidebarRef.current.style.transition = ''
              }
            }, 300)
          } else {
            // If not dragging, still reset transform and transition
            sidebarRef.current.style.transform = ''
            sidebarRef.current.style.transition = ''
          }
        }
      }
      
      // Reset touch references
      touchStartRef.current = null
      touchEndRef.current = null
      lastTouchRef.current = null
      isDraggingRef.current = false
    }

    document.addEventListener('touchstart', handleGlobalTouchStart, { passive: true })
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true })
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleGlobalTouchStart)
      document.removeEventListener('touchmove', handleGlobalTouchMove)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [setOpenMobile])

  return (
    <Sidebar ref={sidebarRef} variant="inset" {...props}>
      <SidebarHeader
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button] h-fit"
            >
              <a href="/" aria-label="Maneuver Home">
                <img
                  src={ManeuverHorizontalLogo}
                  className="row-span-4 scale-75 dark:invert"
                  width="240"
                  height="160"
                  alt="Maneuver Logo Wordmark Horizontal"
                />
              </a>
            </SidebarMenuButton>
            <Separator className="my-1" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
