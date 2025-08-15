import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CommandGroup } from "@/components/ui/command"

interface AddScouterFormProps {
  onAdd: (name: string) => Promise<void>
  onCancel: () => void
}

export function AddScouterForm({ onAdd, onCancel }: AddScouterFormProps) {
  const [newScouterName, setNewScouterName] = useState("")

  const handleAdd = async () => {
    if (newScouterName.trim()) {
      await onAdd(newScouterName.trim())
      setNewScouterName("")
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      await handleAdd()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <CommandGroup>
      <div className="p-2 space-y-2">
        <Input
          placeholder="Enter scouter name..."
          value={newScouterName}
          onChange={(e) => setNewScouterName(e.target.value)}
          onInput={(e) => setNewScouterName((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="name"
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={handleAdd}
            className="flex-1"
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </CommandGroup>
  )
}
