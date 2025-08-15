import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GenericSelector } from '../ui/generic-selector';
import { Trophy, Target, TrendingUp, User, Flame, Award, Users, Star } from 'lucide-react';
import { useCurrentScouter } from '../../hooks/useCurrentScouter';
import { getAllScouters } from '../../lib/scouterGameUtils';
import { getAchievementStats } from '../../lib/achievementUtils';
import type { Scouter } from '../../lib/dexieDB';

export const ScouterProfileWithSelector: React.FC = () => {
  const { currentScouter, isLoading, refreshScouter } = useCurrentScouter();
  const [availableScouters, setAvailableScouters] = useState<Scouter[]>([]);
  const [scouterLoading, setScouterLoading] = useState(true);
  const [achievementStakes, setAchievementStakes] = useState<number>(0);

  useEffect(() => {
    const loadScouters = async () => {
      try {
        const scouters = await getAllScouters();
        setAvailableScouters(scouters);
      } catch (error) {
        console.error('Error loading scouters:', error);
      } finally {
        setScouterLoading(false);
      }
    };

    loadScouters();
  }, []);

  // Load achievement stakes when current scouter changes
  useEffect(() => {
    const loadAchievementStakes = async () => {
      if (currentScouter?.name) {
        try {
          const stats = await getAchievementStats(currentScouter.name);
          setAchievementStakes(stats.totalStakesFromAchievements);
        } catch (error) {
          console.error('Error loading achievement stakes:', error);
          setAchievementStakes(0);
        }
      } else {
        setAchievementStakes(0);
      }
    };

    loadAchievementStakes();
  }, [currentScouter?.name]);

  const calculateAccuracy = () => {
    if (!currentScouter || currentScouter.totalPredictions === 0) return 0;
    return Math.round((currentScouter.correctPredictions / currentScouter.totalPredictions) * 100);
  };

  const handleScouterChange = (scouterName: string) => {
    localStorage.setItem('currentScouter', scouterName);
    window.dispatchEvent(new Event('scouterChanged'));
  };

  if (isLoading || scouterLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Scout Selection
        </CardTitle>
        <CardDescription>
          Select a scout to view their stats and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Scout:</label>
          <GenericSelector
            label="Select Scout"
            value={currentScouter?.name || ''}
            availableOptions={availableScouters.map(s => s.name)}
            onValueChange={handleScouterChange}
            placeholder={availableScouters.length > 0 ? "Choose a scout..." : "No scouts available"}
            displayFormat={(name) => name}
            className="w-full"
          />
        </div>

        {currentScouter ? (
          <div className="space-y-4 pt-4 border-t">
            <div className="text-center">
              <h3 className="font-semibold text-lg">{currentScouter.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scouting Game Stats</p>
            </div>

            {/* Top row - Total Stakes (most important) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Total Stakes</span>
                </div>
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currentScouter.stakes + achievementStakes}</span>
              </div>
            </div>

            {/* Middle row - Stakes breakdown */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-medium">Predicition Stakes</span>
                </div>
                <span className="text-xl font-bold">{currentScouter.stakes}</span>
              </div>

              <div className="col-span-2 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium">Achievement Stakes</span>
                </div>
                <span className="text-xl font-bold">{achievementStakes}</span>
              </div>
            </div>

            {/* Bottom row - Other metrics */}
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-3 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium">Predictions</span>
                </div>
                <span className="text-lg font-bold">{currentScouter.totalPredictions}</span>
              </div>

              <div className="col-span-3 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium">Accuracy</span>
                </div>
                <span className="text-lg font-bold">{calculateAccuracy()}%</span>
              </div>

              <div className="col-span-3 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium">Current Streak</span>
                </div>
                <span className="text-lg font-bold">{currentScouter.currentStreak}</span>
              </div>

              <div className="col-span-3 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium">Best Streak</span>
                </div>
                <span className="text-lg font-bold">{currentScouter.longestStreak}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Correct: {currentScouter.correctPredictions}
              </Badge>
              <Button
                onClick={refreshScouter}
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a scout to view their stats</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};