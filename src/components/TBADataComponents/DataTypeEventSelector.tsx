import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Trophy, 
  Users,
  Download,
  Loader2,
} from 'lucide-react';

export type TBADataType = 'match-data' | 'match-results' | 'event-teams' | 'events' | 'team-info' | 'rankings';

interface DataTypeEventSelectorProps {
  dataType: TBADataType;
  setDataType: (type: TBADataType) => void;
  eventKey: string;
  setEventKey: (key: string) => void;
  apiKey: string;
  matchDataLoading: boolean;
  matchResultsLoading: boolean;
  eventTeamsLoading: boolean;
  onLoadMatchData: () => void;
  onLoadMatchResults: () => void;
  onLoadEventTeams: () => void;
}

export const DataTypeEventSelector: React.FC<DataTypeEventSelectorProps> = ({
  dataType,
  setDataType,
  eventKey,
  setEventKey,
  apiKey,
  matchDataLoading,
  matchResultsLoading,
  eventTeamsLoading,
  onLoadMatchData,
  onLoadMatchResults,
  onLoadEventTeams,
}) => {
  const dataTypeOptions = [
    {
      value: "match-data" as const,
      label: "Match Schedule",
      icon: Database,
      description: "Load team lineups and match schedules"
    },
    {
      value: "match-results" as const, 
      label: "Match Results",
      icon: Trophy,
      description: "Verify predictions against actual results"
    },
    {
      value: "event-teams" as const,
      label: "Event Teams",
      icon: Users,
      description: "Load and store team list for pit scouting assignments"
    },
  ];

  const selectedOption = dataTypeOptions.find(option => option.value === dataType);

  const getLoadButton = () => {
    switch (dataType) {
      case 'match-data':
        return (
          <Button
            className="w-full h-12"
            onClick={onLoadMatchData}
            disabled={matchDataLoading || !apiKey.trim() || !eventKey.trim()}
          >
            {matchDataLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Match Data...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Load Match Data
              </>
            )}
          </Button>
        );
      case 'match-results':
        return (
          <Button
            className="w-full h-12"
            onClick={onLoadMatchResults}
            disabled={matchResultsLoading || !apiKey.trim() || !eventKey.trim()}
          >
            {matchResultsLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Match Results...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Load Match Results
              </>
            )}
          </Button>
        );
      case 'event-teams':
        return (
          <Button
            className="w-full h-12"
            onClick={onLoadEventTeams}
            disabled={eventTeamsLoading || !apiKey.trim() || !eventKey.trim()}
          >
            {eventTeamsLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Teams...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Load Event Teams
              </>
            )}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Data Type & Event</CardTitle>
        <CardDescription>
          Choose what type of TBA data you want to access and enter the event key
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Type</label>
          <Select value={dataType} onValueChange={setDataType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              {dataTypeOptions.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedOption && (
            <p className="text-xs text-muted-foreground">
              {selectedOption.description}
            </p>
          )}
        </div>

        {/* Event Key Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Key</label>
          <Input
            id="sharedEventKey"
            placeholder="e.g., 2024chcmp, 2024week0"
            value={eventKey}
            onChange={(e) => setEventKey(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Event keys can be found on The Blue Alliance event pages
          </p>
        </div>

        {/* Load Button */}
        {getLoadButton()}
      </CardContent>
    </Card>
  );
};
