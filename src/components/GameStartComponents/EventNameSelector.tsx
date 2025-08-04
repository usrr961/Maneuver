import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronsUpDown, Plus, Trash2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EventNameSelectorProps {
  currentEventName: string
  onEventNameChange: (eventName: string) => void
}

export function EventNameSelector({ currentEventName, onEventNameChange }: EventNameSelectorProps) {
  const [open, setOpen] = useState(false)
  const [eventsList, setEventsList] = useState<string[]>([])
  const [newEventName, setNewEventName] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  // Load saved events list on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("eventsList")
    const currentEvent = localStorage.getItem("eventName")
    
    if (savedEvents) {
      try {
        setEventsList(JSON.parse(savedEvents))
      } catch {
        setEventsList([])
      }
    }
    
    // If there's a current event set in localStorage but not passed as prop, update the parent
    if (currentEvent && !currentEventName) {
      onEventNameChange(currentEvent)
    }
  }, [currentEventName, onEventNameChange])

  const saveEvent = (name: string) => {
    if (!name.trim()) return
    
    const trimmedName = name.trim()
    
    // Add to list if not already present
    let updatedList = eventsList
    if (!eventsList.includes(trimmedName)) {
      updatedList = [...eventsList, trimmedName].sort()
      setEventsList(updatedList)
      localStorage.setItem("eventsList", JSON.stringify(updatedList))
    }
    
    // Always set as current event
    onEventNameChange(trimmedName)
    localStorage.setItem("eventName", trimmedName)
    
    setOpen(false)
    setShowAddForm(false)
    setNewEventName("")
    
    toast.success(`Event set to: ${trimmedName}`)
  }

  const removeEvent = (name: string) => {
    const updatedList = eventsList.filter(e => e !== name)
    setEventsList(updatedList)
    localStorage.setItem("eventsList", JSON.stringify(updatedList))
    
    if (currentEventName === name) {
      onEventNameChange("")
      localStorage.removeItem("eventName")
    }
    
    toast.success(`Removed event: ${name}`)
  }

  const handleAddNewEvent = () => {
    if (newEventName.trim()) {
      saveEvent(newEventName)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {currentEventName || "Select event..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search events..." />
          <CommandEmpty>
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground mb-2">No events found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Event
              </Button>
            </div>
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              {eventsList.map((event) => (
                <CommandItem
                  key={event}
                  value={event}
                  onSelect={() => saveEvent(event)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentEventName === event ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {event}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEvent(event)
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
            
            {!showAddForm && eventsList.length > 0 && (
              <CommandGroup>
                <CommandItem onSelect={() => setShowAddForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Event
                </CommandItem>
              </CommandGroup>
            )}
            
            {showAddForm && (
              <CommandGroup>
                <div className="p-2 space-y-2">
                  <Input
                    placeholder="Enter event name/code..."
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddNewEvent()
                      } else if (e.key === "Escape") {
                        setShowAddForm(false)
                        setNewEventName("")
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={handleAddNewEvent}
                      className="flex-1"
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setNewEventName("")
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
      </PopoverContent>
    </Popover>
  )
}
