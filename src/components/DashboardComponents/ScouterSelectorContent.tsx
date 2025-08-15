import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AddScouterForm } from "./AddScouterForm"

interface ScouterSelectorContentProps {
  currentScouter: string
  scoutersList: string[]
  onScouterSelect: (name: string) => Promise<void>
  onScouterRemove: (name: string) => Promise<void>
  onClose?: () => void
}

export function ScouterSelectorContent({ 
  currentScouter, 
  scoutersList, 
  onScouterSelect, 
  onScouterRemove,
  onClose
}: ScouterSelectorContentProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  const getScouterInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3) // Limit to 3 characters
  }

  const handleScouterSelect = async (name: string) => {
    await onScouterSelect(name)
    onClose?.()
    setShowAddForm(false)
  }

  const handleAddScouter = async (name: string) => {
    await onScouterSelect(name) // This will create and select the scouter
    onClose?.()
    setShowAddForm(false)
  }

  const handleCancelAdd = () => {
    setShowAddForm(false)
  }

  return (
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
              onSelect={() => handleScouterSelect(scouter)}
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
                  await onScouterRemove(scouter)
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
          <AddScouterForm 
            onAdd={handleAddScouter}
            onCancel={handleCancelAdd}
          />
        )}
      </CommandList>
    </Command>
  )
}
