import React from 'react';
import { ScouterProfile } from '../components/GameComponents/ScouterProfile';

const ScouterTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Scouter System Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing the scouter database with prediction system
        </p>
      </div>

      <div className="flex justify-center">
        <ScouterProfile />
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-600 mb-2">Basic Scouter Test</h3>
          <ol className="space-y-1 text-sm text-blue-600">
            <li>1. Select or create a scouter in the sidebar</li>
            <li>2. The profile above should show their stats automatically</li>
            <li>3. Switch to a different scouter in the sidebar</li>
            <li>4. Profile should update to show the new scouter's data</li>
            <li>5. Refresh the page - data should persist</li>
          </ol>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-600 mb-2">Prediction System Test</h3>
          <ol className="space-y-1 text-sm text-amber-600">
            <li>1. Select a scouter from the sidebar</li>
            <li>2. Go to Game Start page (/game-start)</li>
            <li>3. Fill in event name and match number</li>
            <li>4. Select a prediction (Red Wins, Blue Wins, or None)</li>
            <li>5. Prediction is automatically saved to ScouterGameDB</li>
            <li>6. Change match number to see prediction reset</li>
            <li>7. Return to same match to see saved prediction</li>
          </ol>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Database Schema</h3>
          <div className="space-y-2 text-xs">
            <div>
              <strong>Scouters Table:</strong>
              <pre className="text-gray-600 dark:text-gray-400 ml-2">
{`name, points, totalPredictions, 
correctPredictions, createdAt, lastUpdated`}
              </pre>
            </div>
            <div>
              <strong>Predictions Table:</strong>
              <pre className="text-gray-600 dark:text-gray-400 ml-2">
{`id, scouterName, eventName, matchNumber,
predictedWinner, actualWinner, isCorrect,
pointsAwarded, timestamp, verified`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScouterTestPage;
