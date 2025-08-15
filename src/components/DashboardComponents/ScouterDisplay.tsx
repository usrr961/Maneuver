import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Trophy } from "lucide-react"

interface ScouterDisplayProps {
  currentScouter: string
  currentScouterStakes: number
}

export function ScouterDisplay({ currentScouter, currentScouterStakes }: ScouterDisplayProps) {
  const getScouterInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3) // Limit to 3 characters
  }

  return (
    <>
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
    </>
  )
}
