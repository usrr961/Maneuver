import React, { useState } from 'react';

// Import hooks and components
import { useTBAData } from '@/hooks/useTBAData';
import ApiKeyForm from '@/components/MatchResultsComponents/ApiKeyForm';
import MatchDataLoader from '@/components/TBADataComponents/MatchDataLoader';
import { MatchSelector } from '@/components/MatchResultsComponents/MatchSelector';
import { ProcessingResults } from '@/components/MatchResultsComponents/ProcessingResults';
import { DataTypeEventSelector, type TBADataType } from '@/components/TBADataComponents/DataTypeEventSelector';
import { EventTeamsDisplay } from '@/components/TBADataComponents/EventTeamsDisplay';

interface ProcessingResult {
  matchNumber: number;
  winner: string;
  predictionsCount: number;
  correctPredictions: number;
  stakesAwarded: number;
}

const TBADataPage: React.FC = () => {
  // Shared state for API configuration
  const [apiKey, setApiKey] = useState('');
  const [eventKey, setEventKey] = useState('');
  const [rememberForSession, setRememberForSession] = useState(false);
  const [dataType, setDataType] = useState<TBADataType>('match-data');
  
  // Processing results state
  const [processedResults, setProcessedResults] = useState<ProcessingResult[]>([]);

  // Use the TBA data hook
  const {
    matchDataLoading,
    matchResultsLoading,
    eventTeamsLoading,
    matches,
    teams,
    isStored,
    fetchMatchDataFromTBA,
    loadMatchResults,
    loadEventTeams,
    handleStoreTeams,
    handleClearStored,
  } = useTBAData();

  // Handler functions that call the hook functions with current state
  const handleLoadMatchData = () => {
    fetchMatchDataFromTBA(apiKey, eventKey, rememberForSession, setApiKey);
  };

  const handleLoadMatchResults = () => {
    loadMatchResults(apiKey, eventKey, rememberForSession, setApiKey);
  };

  const handleLoadEventTeams = () => {
    loadEventTeams(apiKey, eventKey, rememberForSession, setApiKey);
  };

  const handleProcessingComplete = (results: ProcessingResult[]) => {
    setProcessedResults(results);
  };

  // Create handlers with correct signatures for the components
  const handleStoreTeamsWithEventKey = () => {
    handleStoreTeams(eventKey);
  };

  const handleClearStoredWithEventKey = () => {
    handleClearStored(eventKey);
  };

  return (
    <div className="min-h-screen container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="text-start">
        <h1 className="text-3xl font-bold">TBA Data</h1>
        <p className="text-muted-foreground">
          Import match schedules, results, and team lists from The Blue Alliance
        </p>
      </div>

      {/* API Key Form */}
      <ApiKeyForm
        apiKey={apiKey}
        setApiKey={setApiKey}
        rememberForSession={rememberForSession}
        setRememberForSession={setRememberForSession}
      />

      {/* Data Type and Event Selector */}
      <DataTypeEventSelector
        dataType={dataType}
        setDataType={setDataType}
        eventKey={eventKey}
        setEventKey={setEventKey}
        apiKey={apiKey}
        onLoadMatchData={handleLoadMatchData}
        onLoadMatchResults={handleLoadMatchResults}
        onLoadEventTeams={handleLoadEventTeams}
        matchDataLoading={matchDataLoading}
        matchResultsLoading={matchResultsLoading}
        eventTeamsLoading={eventTeamsLoading}
      />

      {/* Match Data Loader */}
      {dataType === 'match-data' && (
        <MatchDataLoader />
      )}

      {/* Match Results Section */}
      {dataType === 'match-results' && (
        <>
          <MatchSelector matches={matches} onProcessingComplete={handleProcessingComplete} />
          
          {processedResults.length > 0 && (
            <ProcessingResults results={processedResults} />
          )}
        </>
      )}

      {/* Event Teams Display */}
      {dataType === 'event-teams' && (
        <EventTeamsDisplay
          teams={teams}
          eventKey={eventKey}
          isStored={isStored}
          onStoreTeams={handleStoreTeamsWithEventKey}
          onClearStored={handleClearStoredWithEventKey}
        />
      )}
    </div>
  );
};

export default TBADataPage;
