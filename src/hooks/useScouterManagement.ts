import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { getOrCreateScouterByName, deleteScouter, getScouter } from "@/lib/scouterGameUtils"

export function useScouterManagement() {
  const [currentScouter, setCurrentScouter] = useState("")
  const [currentScouterStakes, setCurrentScouterStakes] = useState(0)
  const [scoutersList, setScoutersList] = useState<string[]>([])

  // Load saved scouters and current scouter
  const loadScouters = useCallback(async () => {
    // Load from localStorage - this is the source of truth for selectable scouters
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
    
    // Set the selectable scouters list from localStorage only
    // This respects the user's choice when importing ("Import Data Only" vs "Add to Selectable List")
    setScoutersList(localStorageScouters)
    
    // Ensure any localStorage scouters exist in DB (for backwards compatibility)
    try {
      for (const scouterName of localStorageScouters) {
        await getOrCreateScouterByName(scouterName)
      }
    } catch (error) {
      console.error("Error ensuring scouters exist in database:", error)
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
  }, [])

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
    } catch (error) {
      console.error("Error creating scouter in database:", error)
      toast.error(`Failed to save scouter to database: ${error}`)
    }
    
    toast.success(`Switched to scouter: ${trimmedName}`)
  }

  const removeScouter = async (name: string) => {
    const updatedList = scoutersList.filter(s => s !== name)
    setScoutersList(updatedList)
    localStorage.setItem("scoutersList", JSON.stringify(updatedList))
    
    // Remove from database
    try {
      await deleteScouter(name)
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

  const clearScouterData = () => {
    setCurrentScouter("")
    setCurrentScouterStakes(0)
    setScoutersList([])
  }

  // Load saved scouters and current scouter on component mount
  useEffect(() => {
    const handleScouterDataCleared = () => {
      clearScouterData()
      // Don't reload data since it was just cleared - the component will remain in cleared state
    }
    
    // Listen for scouter data updated event (when profiles are imported)
    const handleScouterDataUpdated = async () => {
      // Reload scouters to pick up any newly imported ones
      await loadScouters()
      // Also refresh current scouter stakes in case they were updated
      const savedCurrentScouter = localStorage.getItem("currentScouter") || localStorage.getItem("scouterInitials")
      if (savedCurrentScouter) {
        await updateCurrentScouterStakes(savedCurrentScouter)
      }
    }
    
    loadScouters()
    
    // Add event listeners
    window.addEventListener('scouterDataCleared', handleScouterDataCleared)
    window.addEventListener('scouterDataUpdated', handleScouterDataUpdated)
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('scouterDataCleared', handleScouterDataCleared)
      window.removeEventListener('scouterDataUpdated', handleScouterDataUpdated)
    }
  }, [loadScouters])

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

  return {
    currentScouter,
    currentScouterStakes,
    scoutersList,
    saveScouter,
    removeScouter,
    loadScouters
  }
}
