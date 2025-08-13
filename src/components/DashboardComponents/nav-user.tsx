import { useState, useEffect } from "react"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronsUpDown, Plus, Trash2, User, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getOrCreateScouterByName, getAllScouters, deleteScouter, getScouter } from "@/lib/scouterGameUtils"

export function NavUser() {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useState(false)
  const [currentScouter, setCurrentScouter] = useState("")
  const [currentScouterStakes, setCurrentScouterStakes] = useState(0)
  const [scoutersList, setScoutersList] = useState<string[]>([])
  const [newScouterName, setNewScouterName] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  // Load saved scouters and current scouter on component mount
  useEffect(() => {
    const loadScouters = async () => {
      // Load from localStorage for backwards compatibility
      const savedScouters = localStorage.getItem("scoutersList")
      const savedCurrentScouter = localStorage.getItem("scouterInitials") || localStorage.getItem("currentScouter")
      
      let localStorageScouters: string[] = []
      if (savedScouters) {
        try {
          localStorageScouters = JSON.parse(savedScouters)
        } catch {
          localStorageScouters = []
        }
      }
      
      // Load from ScouterGameDB
      try {
        const dbScouters = await getAllScouters()
        const dbScouterNames = dbScouters.map(s => s.name)
        
        // Combine and deduplicate scouters from both sources
        const allScouters = [...new Set([...localStorageScouters, ...dbScouterNames])].sort()
        setScoutersList(allScouters)
        
        // Update localStorage to include any scouters that were only in DB
        localStorage.setItem("scoutersList", JSON.stringify(allScouters))
        
        // Ensure any localStorage scouters exist in DB
        for (const scouterName of localStorageScouters) {
          if (!dbScouterNames.includes(scouterName)) {
            await getOrCreateScouterByName(scouterName)
          }
        }
      } catch (error) {
        console.error("Error loading scouters from database:", error)
        // Fallback to localStorage only
        setScoutersList(localStorageScouters)
      }
      
      if (savedCurrentScouter) {
        setCurrentScouter(savedCurrentScouter)
        // Ensure current scouter exists in DB and load their stakes
        try {
          const scouter = await getOrCreateScouterByName(savedCurrentScouter)
          setCurrentScouterStakes(scouter.stakes)
        } catch (error) {
          console.error("Error creating current scouter in database:", error)
        }
      }
    }
    
    // Listen for scouter data cleared event
    const handleScouterDataCleared = () => {
      console.log("NavUser - Received scouterDataCleared event, clearing state...")
      setCurrentScouter("")
      setCurrentScouterStakes(0)
      setScoutersList([])
      // Don't reload data since it was just cleared - the component will remain in cleared state
    }
    
    loadScouters()
    
    // Add event listener for scouter data clearing
    window.addEventListener('scouterDataCleared', handleScouterDataCleared)
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('scouterDataCleared', handleScouterDataCleared)
    }
  }, [])

  // Refresh current scouter stakes periodically
  useEffect(() => {
    if (!currentScouter) return

    const refreshStakes = async () => {
      await updateCurrentScouterStakes(currentScouter)
    }

    // Initial load
    refreshStakes()

    // Refresh every 30 seconds
    const interval = setInterval(refreshStakes, 30000)

    return () => clearInterval(interval)
  }, [currentScouter])

  // Function to update current scouter stakes
  const updateCurrentScouterStakes = async (scouterName: string) => {
    if (!scouterName) {
      setCurrentScouterStakes(0)
      return
    }
    
    try {
      const scouter = await getScouter(scouterName)
      setCurrentScouterStakes(scouter?.stakes || 0)
    } catch (error) {
      console.error("Error fetching scouter stakes:", error)
      setCurrentScouterStakes(0)
    }
  }

  const saveScouter = async (name: string) => {
    if (!name.trim()) return
    
    const trimmedName = name.trim()
    const updatedList = scoutersList.includes(trimmedName) 
      ? scoutersList 
      : [...scoutersList, trimmedName].sort()
    
    setScoutersList(updatedList)
    setCurrentScouter(trimmedName)
    
    // Save to localStorage
    localStorage.setItem("scoutersList", JSON.stringify(updatedList))
    localStorage.setItem("currentScouter", trimmedName)
    localStorage.setItem("scouterInitials", trimmedName) // For backwards compatibility
    
    // Create/update scouter in ScouterGameDB and get their stakes
    try {
      const scouter = await getOrCreateScouterByName(trimmedName)
      setCurrentScouterStakes(scouter.stakes)
      console.log(`Scouter "${trimmedName}" created/updated in ScouterGameDB`)
    } catch (error) {
      console.error("Error creating scouter in database:", error)
      toast.error(`Failed to save scouter to database: ${error}`)
    }
    
    setOpen(false)
    setShowAddForm(false)
    setNewScouterName("")
    
    toast.success(`Switched to scouter: ${trimmedName}`)
  }

  const removeScouter = async (name: string) => {
    const updatedList = scoutersList.filter(s => s !== name)
    setScoutersList(updatedList)
    localStorage.setItem("scoutersList", JSON.stringify(updatedList))
    
    // Remove from database
    try {
      await deleteScouter(name)
      console.log(`Scouter "${name}" removed from ScouterGameDB`)
    } catch (error) {
      console.error("Error removing scouter from database:", error)
      // Don't show error toast as this is not critical
    }
    
    if (currentScouter === name) {
      setCurrentScouter("")
      setCurrentScouterStakes(0)
      localStorage.removeItem("currentScouter")
      localStorage.removeItem("scouterInitials")
    }
    
    toast.success(`Removed scouter: ${name}`)
  }

  const handleAddNewScouter = async () => {
    if (newScouterName.trim()) {
      await saveScouter(newScouterName)
    }
  }

  const getScouterInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3) // Limit to 3 characters
  }

  // Shared command content component
  const ScouterCommandContent = () => (
    <Command>
      <CommandInput placeholder="Search scouters..." />
      <CommandEmpty>
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground mb-2">No scouters found</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Scouter
          </Button>
        </div>
      </CommandEmpty>
      <CommandList>
        <CommandGroup>
          {scoutersList.map((scouter) => (
            <CommandItem
              key={scouter}
              value={scouter}
              onSelect={async () => await saveScouter(scouter)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentScouter === scouter ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-muted">
                      {getScouterInitials(scouter)}
                    </AvatarFallback>
                  </Avatar>
                  {scouter}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async (e) => {
                  e.stopPropagation()
                  await removeScouter(scouter)
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </CommandItem>
          ))}
        </CommandGroup>
        
        {!showAddForm && scoutersList.length > 0 && (
          <CommandGroup>
            <CommandItem onSelect={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Scouter
            </CommandItem>
          </CommandGroup>
        )}
        
        {showAddForm && (
          <CommandGroup>
            <div className="p-2 space-y-2">
              <Input
                placeholder="Enter scouter name..."
                value={newScouterName}
                onChange={(e) => setNewScouterName(e.target.value)}
                onInput={(e) => setNewScouterName((e.target as HTMLInputElement).value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    await handleAddNewScouter()
                  } else if (e.key === "Escape") {
                    setShowAddForm(false)
                    setNewScouterName("")
                  }
                }}
                autoFocus
                autoComplete="name"
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={handleAddNewScouter}
                  className="flex-1"
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewScouterName("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )

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
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {currentScouter ? getScouterInitials(currentScouter) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentScouter || "Select Scouter"}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {currentScouter ? (
                    <div className="flex items-center gap-1">
                      <span>Active Scouter</span>
                      <span className="text-xs">•</span>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span>{currentScouterStakes}</span>
                      </div>
                    </div>
                  ) : (
                    "No scouter selected"
                  )}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="w-[90vw] max-w-md p-0 top-[30%] translate-y-[-30%] sm:top-[50%] sm:translate-y-[-50%]">
                <DialogHeader className="p-4 pb-0">
                  <DialogTitle>Select Scouter</DialogTitle>
                </DialogHeader>
                <div className="p-0">
                  <ScouterCommandContent />
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
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {currentScouter ? getScouterInitials(currentScouter) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {currentScouter || "Select Scouter"}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {currentScouter ? (
                      <div className="flex items-center gap-1">
                        <span>Active Scouter</span>
                        <span className="text-xs">•</span>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          <span>{currentScouterStakes}</span>
                        </div>
                      </div>
                    ) : (
                      "No scouter selected"
                    )}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[300px] p-0" 
              side="right"
              align="start"
            >
              <ScouterCommandContent />
            </PopoverContent>
          </Popover>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
