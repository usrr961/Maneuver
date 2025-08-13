import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GenericSelector } from '../ui/generic-selector';
import { Trophy, Target, User, Flame, Award, TrendingUpDown } from 'lucide-react';
import { getAllScouters, calculateAccuracy } from '../../lib/scouterGameUtils';
import type { Scouter } from '../../lib/dexieDB';

export const ScouterProfileWithSelector: React.FC = () => {
  const [scouters, setScouters] = useState<Scouter[]>([]);
  const [selectedScouterName, setSelectedScouterName] = useState<string>('');
  const [selectedScouter, setSelectedScouter] = useState<Scouter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all scouts on component mount
  useEffect(() => {
    const loadScouts = async () => {
      setIsLoading(true);
      try {
        const allScouts = await getAllScouters();
        setScouters(allScouts);
        
        // Auto-select the first scout if available
        if (allScouts.length > 0) {
          setSelectedScouterName(allScouts[0].name);
          setSelectedScouter(allScouts[0]);
        }
      } catch (error) {
        console.error('Error loading scouts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScouts();
  }, []);

  // Update selected scout when selection changes
  useEffect(() => {
    if (selectedScouterName) {
      const scouter = scouters.find(s => s.name === selectedScouterName);
      setSelectedScouter(scouter || null);
    }
  }, [selectedScouterName, scouters]);

  const refreshScouts = async () => {
    try {
      const allScouts = await getAllScouters();
      setScouters(allScouts);
      
      // Update the selected scout with fresh data
      if (selectedScouterName) {
        const updatedScouter = allScouts.find(s => s.name === selectedScouterName);
        setSelectedScouter(updatedScouter || null);
      }
    } catch (error) {
      console.error('Error refreshing scouts:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (scouters.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            No Scouts Available
          </CardTitle>
          <CardDescription>
            Create scouts and make predictions to see individual stats
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Individual Scout Stats
          </CardTitle>
          
          {/* Scout Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Scout:</span>
            <GenericSelector
              label="Select Scout"
              value={selectedScouterName}
              availableOptions={scouters.map(s => s.name)}
              onValueChange={setSelectedScouterName}
              placeholder="Select a scout"
              displayFormat={(name) => name}
              className="flex-1"
            />
          </div>
        </div>
      </CardHeader>
      
      {selectedScouter && (
        <CardContent className="space-y-4">
          {/* Stakes Display */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Stakes</span>
            </div>
            <Badge variant="secondary" className="text-lg font-bold">
              {selectedScouter.stakes}
            </Badge>
          </div>

          {/* Predictions Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUpDown className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Predicitions</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedScouter.totalPredictions}
              </div>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {calculateAccuracy(selectedScouter)}%
              </div>
            </div>
          </div>

          {/* Streak Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Current Streak</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {selectedScouter.currentStreak}
              </div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Best Streak</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {selectedScouter.longestStreak}
              </div>
            </div>
          </div>

          {/* Correct Predictions */}
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Correct Predictions
            </div>
            <div className="text-xl font-bold">
              {selectedScouter.correctPredictions} / {selectedScouter.totalPredictions}
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Created: {new Date(selectedScouter.createdAt).toLocaleDateString()}</div>
            <div>Last Updated: {new Date(selectedScouter.lastUpdated).toLocaleDateString()}</div>
            {selectedScouter.totalPredictions > 0 && (
              <div>Predictions Made: {selectedScouter.totalPredictions}</div>
            )}
          </div>

          {/* Refresh Button */}
          <Button onClick={refreshScouts} className="w-full">
            Refresh Stats
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
