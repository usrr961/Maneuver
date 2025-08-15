import { useState, useEffect, useMemo } from 'react';
import { getAllScouters, calculateAccuracy } from '@/lib/scouterGameUtils';
import { getAchievementStats } from '@/lib/achievementUtils';
import type { Scouter } from '@/lib/dexieDB';
import { analytics } from '@/lib/analytics';

export type ScouterMetric = "stakes" | "totalStakes" | "totalPredictions" | "correctPredictions" | "accuracy" | "currentStreak" | "longestStreak";

export interface ScouterChartData {
  name: string;
  value: number;
  scouter: Scouter;
}

export function useScoutDashboard() {
  const [scouters, setScouters] = useState<Scouter[]>([]);
  const [achievementStakes, setAchievementStakes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<ScouterMetric>("totalStakes");
  const [chartType, setChartType] = useState<"bar" | "line" | "table">("bar");

  const metricOptions = [
    { key: "totalStakes", label: "Total Stakes", icon: "Trophy" },
    { key: "stakes", label: "Prediction Stakes", icon: "Trophy" },
    { key: "totalPredictions", label: "Total Predictions", icon: "Target" },
    { key: "correctPredictions", label: "Correct Predictions", icon: "Award" },
    { key: "accuracy", label: "Accuracy %", icon: "TrendingUp" },
    { key: "currentStreak", label: "Current Streak", icon: "TrendingUp" },
    { key: "longestStreak", label: "Best Streak", icon: "Award" },
  ];

  const loadScoutData = async () => {
    setLoading(true);
    try {
      const scoutData = await getAllScouters();
      setScouters(scoutData);
      
      // Load achievement stakes for each scouter
      const achievementStakesMap: Record<string, number> = {};
      for (const scouter of scoutData) {
        try {
          const stats = await getAchievementStats(scouter.name);
          achievementStakesMap[scouter.name] = stats.totalStakesFromAchievements;
        } catch (error) {
          console.error(`Error loading achievement stats for ${scouter.name}:`, error);
          achievementStakesMap[scouter.name] = 0;
        }
      }
      setAchievementStakes(achievementStakesMap);
      
      analytics.trackEvent('scout_dashboard_loaded', { scoutCount: scoutData.length });
    } catch (error) {
      console.error('❌ Error loading scout data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScoutData();
  }, []);

  const chartData = useMemo(() => {
    return scouters
      .map(scouter => {
        let value: number;
        switch (chartMetric) {
          case "accuracy":
            value = calculateAccuracy(scouter);
            break;
          case "totalStakes": {
            // Total stakes = prediction stakes + achievement stakes
            const predictionStakes = scouter.stakes;
            const achievementStakesValue = achievementStakes[scouter.name] || 0;
            value = predictionStakes + achievementStakesValue;
            
            // Debug logging for Riley Davis
            if (scouter.name === "Riley Davis") {
              console.log(`🔍 Riley Davis Stakes Debug:`, {
                predictionStakes,
                achievementStakesValue,
                totalValue: value,
                achievementStakesObject: achievementStakes
              });
            }
            break;
          }
          default:
            value = scouter[chartMetric] as number;
        }
        
        return {
          name: scouter.name,
          value,
          scouter
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [scouters, chartMetric, achievementStakes]);

  // Line chart data - shows progression over number of matches
  const lineChartData = useMemo(() => {
    if (chartType !== "line" || scouters.length === 0) return [];
    
    // For line chart, we'll simulate progression data
    // In a real implementation, you'd fetch historical prediction data
    const maxMatches = Math.max(...scouters.map(s => s.totalPredictions));
    const dataPoints: Array<{ matchNumber: number; [scouterName: string]: number }> = [];
    
    // Create data points for each match number
    for (let matchNum = 1; matchNum <= Math.min(maxMatches, 20); matchNum++) {
      const point: { matchNumber: number; [scouterName: string]: number } = { matchNumber: matchNum };
      
      // For each scout, calculate their metric value at this point in time
      scouters.slice(0, 6).forEach((scouter) => {
        if (scouter.totalPredictions >= matchNum) {
          let value: number;
          switch (chartMetric) {
            case "accuracy":
              // Simulate accuracy progression (in real app, calculate from historical data)
              value = Math.min(100, (scouter.correctPredictions / matchNum) * 100);
              break;
            case "stakes":
              // Simulate stakes progression
              value = Math.floor((scouter.stakes / scouter.totalPredictions) * matchNum);
              break;
            case "totalStakes": {
              // For total stakes, add achievement stakes to prediction stakes progression
              const predictionStakesProgression = Math.floor((scouter.stakes / scouter.totalPredictions) * matchNum);
              const achievementStakesForScouter = achievementStakes[scouter.name] || 0;
              value = predictionStakesProgression + achievementStakesForScouter;
              break;
            }
            case "currentStreak":
              // For streaks, just show current value after they reach that point
              value = matchNum === scouter.totalPredictions ? scouter.currentStreak : 0;
              break;
            case "longestStreak":
              // Simulate longest streak growth
              value = Math.floor((scouter.longestStreak / scouter.totalPredictions) * matchNum);
              break;
            default:
              value = Math.floor((scouter[chartMetric] as number / scouter.totalPredictions) * matchNum);
          }
          point[scouter.name] = value;
        }
      });
      dataPoints.push(point);
    }
    
    return dataPoints;
  }, [scouters, chartMetric, chartType, achievementStakes]);

  return {
    scouters,
    achievementStakes,
    loading,
    chartMetric,
    setChartMetric,
    chartType,
    setChartType,
    metricOptions,
    chartData,
    lineChartData,
    loadScoutData
  };
}
