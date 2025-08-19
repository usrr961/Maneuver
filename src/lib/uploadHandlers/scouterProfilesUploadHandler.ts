import { toast } from "sonner";
import { gameDB, type Scouter, type MatchPrediction } from "@/lib/dexieDB";
import type { UploadMode } from "./scoutingDataUploadHandler";

export const handleScouterProfilesUpload = async (jsonData: unknown, mode: UploadMode): Promise<void> => {
  if (!jsonData || typeof jsonData !== 'object' || !('scouters' in jsonData) || !('predictions' in jsonData)) {
    toast.error("Invalid scouter profiles format");
    return;
  }

  const data = jsonData as { scouters: Scouter[]; predictions: MatchPrediction[] };
  const scoutersToImport = data.scouters || [];
  const predictionsToImport = data.predictions || [];

  try {
    let scoutersAdded = 0;
    let scoutersUpdated = 0;
    let predictionsAdded = 0;

    if (mode === 'overwrite') {
      // Clear existing data
      await gameDB.scouters.clear();
      await gameDB.predictions.clear();
      
      // Add all new data
      await gameDB.scouters.bulkAdd(scoutersToImport);
      await gameDB.predictions.bulkAdd(predictionsToImport);
      
      scoutersAdded = scoutersToImport.length;
      predictionsAdded = predictionsToImport.length;
    } else {
      // Get existing data for smart merge/append
      const existingScouters = await gameDB.scouters.toArray();
      const existingPredictions = await gameDB.predictions.toArray();
      
      // Process scouters
      for (const scouter of scoutersToImport) {
        const existing = existingScouters.find(s => s.name === scouter.name);
        
        if (existing) {
          if (mode === 'smart-merge') {
            // Only update if new data is newer or has higher values
            const shouldUpdate = 
              scouter.lastUpdated > existing.lastUpdated ||
              scouter.stakes > existing.stakes ||
              scouter.totalPredictions > existing.totalPredictions;
              
            if (shouldUpdate) {
              await gameDB.scouters.update(scouter.name, {
                stakes: Math.max(scouter.stakes, existing.stakes),
                totalPredictions: Math.max(scouter.totalPredictions, existing.totalPredictions),
                correctPredictions: Math.max(scouter.correctPredictions, existing.correctPredictions),
                currentStreak: scouter.lastUpdated > existing.lastUpdated ? scouter.currentStreak : existing.currentStreak,
                longestStreak: Math.max(scouter.longestStreak, existing.longestStreak),
                lastUpdated: Math.max(scouter.lastUpdated, existing.lastUpdated)
              });
              scoutersUpdated++;
            }
          } else if (mode === 'append') {
            // Force update in append mode
            await gameDB.scouters.put(scouter);
            scoutersUpdated++;
          }
        } else {
          // Add new scouter
          await gameDB.scouters.add(scouter);
          scoutersAdded++;
        }
      }
      
      // Process predictions
      for (const prediction of predictionsToImport) {
        const exists = existingPredictions.some(p => p.id === prediction.id);
        
        if (!exists) {
          try {
            await gameDB.predictions.add(prediction);
            predictionsAdded++;
          } catch {
            // Duplicate constraint, skip in smart merge
            if (mode === 'append') {
              console.warn(`Skipping duplicate prediction: ${prediction.id}`);
            }
          }
        }
      }
    }

    const message = mode === 'overwrite' 
      ? `Overwritten with ${scoutersAdded} scouters and ${predictionsAdded} predictions`
      : `Profiles: ${scoutersAdded} new scouters, ${scoutersUpdated} updated scouters, ${predictionsAdded} predictions imported`;
    
    toast.success(message);
  } catch (error) {
    console.error('Error importing scouter profiles:', error);
    toast.error("Failed to import scouter profiles");
  }
};
