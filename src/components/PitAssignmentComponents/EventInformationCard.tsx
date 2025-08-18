import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ClipboardList } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventInformationCardProps {
  eventTeams: { [eventKey: string]: number[] };
  availableEvents: string[];
  selectedEvent: string;
  teamDataSource: { [eventKey: string]: 'nexus' | 'tba' };
  currentTeams: number[];
  pitAddresses: { [teamNumber: string]: string } | null;
  onEventChange: (eventKey: string) => void;
}

const EventInformationCard: React.FC<EventInformationCardProps> = ({
  eventTeams,
  availableEvents,
  selectedEvent,
  teamDataSource,
  currentTeams,
  pitAddresses,
  onEventChange,
}) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Event Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(eventTeams).length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No team data found. Please import team lists from the TBA Data page (TBA teams or Nexus pit data with teams).
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Event Selection:</span>
                {availableEvents.length > 0 ? (
                  <Select value={selectedEvent} onValueChange={onEventChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEvents.map(eventKey => {
                        const isNexus = teamDataSource[eventKey] === 'nexus';
                        const teamCount = eventTeams[eventKey]?.length || 0;
                        return (
                          <SelectItem key={eventKey} value={eventKey}>
                            <div className="flex items-center gap-2">
                              <span>{eventKey}</span>
                              {isNexus && <span className="text-xs text-blue-600">(Nexus)</span>}
                              <span className="text-xs text-muted-foreground">({teamCount} teams)</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-muted-foreground">No events available</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Event:</span>
                <span className="text-lg font-semibold text-primary">{selectedEvent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Teams to Scout:</span>
                <span className="text-lg font-semibold">{currentTeams.length}</span>
              </div>
              {pitAddresses && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">With Pit Locations:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Object.keys(pitAddresses).length} teams
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Source:</span>
                <span className="text-sm font-medium capitalize">
                  {teamDataSource[selectedEvent] === 'nexus' ? (
                    <span className="text-blue-600 flex items-center gap-1">
                      <span>Nexus</span>
                      <span className="text-xs text-muted-foreground">(with pit locations)</span>
                    </span>
                  ) : (
                    <span className="text-orange-600">TBA</span>
                  )}
                </span>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t">
                {teamDataSource[selectedEvent] === 'nexus' 
                  ? 'Teams extracted from Nexus pit addresses. Pit locations available for enhanced assignments.'
                  : 'Teams imported from The Blue Alliance. Import new data on the TBA Data page to change events.'
                }
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventInformationCard;
