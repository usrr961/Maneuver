import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GenericSelector } from '../ui/generic-selector';
import { Trophy, Target, TrendingUp, User, Flame, Award, Users } from 'lucide-react';
import { useCurrentScouter } from '../../hooks/useCurrentScouter';
import { getAllScouters } from '../../lib/scouterGameUtils';
import type { Scouter } from '../../lib/dexieDB';

export const ScouterProfileWithSelector: React.FC = () => {
  const { currentScouter, isLoading, refreshScouter } = useCurrentScouter();
  const [availableScouters, setAvailableScouters] = useState<Scouter[]>([]);
  const [scouterLoading, setScouterLoading] = useState(true);

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

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Stakes</span>
                </div>
                <span className="text-xl font-bold">{currentScouter.stakes}</span>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Predictions</span>
                </div>
                <span className="text-xl font-bold">{currentScouter.totalPredictions}</span>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Accuracy</span>
                </div>
                <span className="text-xl font-bold">{calculateAccuracy()}%</span>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Streak</span>
                </div>
                <span className="text-xl font-bold">{currentScouter.currentStreak}</span>
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