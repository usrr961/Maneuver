// The Blue Alliance API utilities
const TBA_BASE_URL = 'https://www.thebluealliance.com/api/v3';
// Replace this with your actual TBA API key from https://www.thebluealliance.com/account
const TBA_AUTH_KEY = 'YOUR_TBA_API_KEY_HERE';

export interface TBAMatch {
  key: string;
  comp_level: string;
  set_number: number;
  match_number: number;
  alliances: {
    red: {
      score: number;
      team_keys: string[];
      surrogate_team_keys?: string[];
      dq_team_keys?: string[];
    };
    blue: {
      score: number;
      team_keys: string[];
      surrogate_team_keys?: string[];
      dq_team_keys?: string[];
    };
  };
  score_breakdown: Record<string, unknown> | null;
  winning_alliance: 'red' | 'blue' | '';
  event_key: string;
  time: number;
  actual_time: number;
  predicted_time: number;
  post_result_time: number;
}

export interface TBAEvent {
  key: string;
  name: string;
  event_code: string;
  event_type: number;
  district?: {
    abbreviation: string;
    display_name: string;
    key: string;
    year: number;
  };
  city: string;
  state_prov: string;
  country: string;
  start_date: string;
  end_date: string;
  year: number;
  short_name: string;
  event_type_string: string;
  week?: number;
  address?: string;
  postal_code?: string;
  gmaps_place_id?: string;
  gmaps_url?: string;
  lat?: number;
  lng?: number;
  location_name?: string;
  timezone?: string;
  website?: string;
  first_event_id?: string;
  first_event_code?: string;
  webcasts?: Array<{
    type: string;
    channel: string;
    date?: string;
    file?: string;
  }>;
  division_keys?: string[];
  parent_event_key?: string;
  playoff_type?: number;
  playoff_type_string?: string;
}

// Helper function to make TBA API requests
const makeTBARequest = async (endpoint: string): Promise<unknown> => {
  const response = await fetch(`${TBA_BASE_URL}${endpoint}`, {
    headers: {
      'X-TBA-Auth-Key': TBA_AUTH_KEY,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`TBA API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Get all events for a year
export const getEventsForYear = async (year: number): Promise<TBAEvent[]> => {
  return makeTBARequest(`/events/${year}`) as Promise<TBAEvent[]>;
};

// Search events by name/code
export const searchEvents = async (year: number, query: string): Promise<TBAEvent[]> => {
  const events = await getEventsForYear(year);
  const searchTerm = query.toLowerCase();
  
  return events.filter(event => 
    event.name.toLowerCase().includes(searchTerm) ||
    event.event_code.toLowerCase().includes(searchTerm) ||
    event.short_name.toLowerCase().includes(searchTerm)
  );
};

// Get matches for an event
export const getEventMatches = async (eventKey: string): Promise<TBAMatch[]> => {
  return makeTBARequest(`/event/${eventKey}/matches`) as Promise<TBAMatch[]>;
};

// Get a specific match
export const getMatch = async (matchKey: string): Promise<TBAMatch> => {
  return makeTBARequest(`/match/${matchKey}`) as Promise<TBAMatch>;
};

// Get matches for a specific event and filter by qualification matches
export const getQualificationMatches = async (eventKey: string): Promise<TBAMatch[]> => {
  const matches = await getEventMatches(eventKey);
  return matches
    .filter(match => match.comp_level === 'qm')
    .sort((a, b) => a.match_number - b.match_number);
};

// Get playoff matches for an event
export const getPlayoffMatches = async (eventKey: string): Promise<TBAMatch[]> => {
  const matches = await getEventMatches(eventKey);
  return matches.filter(match => match.comp_level !== 'qm');
};

// Get match results with winner determination
export const getMatchResult = (match: TBAMatch): {
  redScore: number;
  blueScore: number;
  winner: 'red' | 'blue' | 'tie';
  winningAlliance: 'red' | 'blue' | '';
} => {
  const redScore = match.alliances.red.score;
  const blueScore = match.alliances.blue.score;
  
  let winner: 'red' | 'blue' | 'tie';
  if (redScore > blueScore) {
    winner = 'red';
  } else if (blueScore > redScore) {
    winner = 'blue';
  } else {
    winner = 'tie';
  }

  return {
    redScore,
    blueScore,
    winner,
    winningAlliance: match.winning_alliance || (winner === 'tie' ? '' : winner)
  };
};

// Build match key from event key and match number
export const buildMatchKey = (eventKey: string, matchNumber: number, compLevel: string = 'qm'): string => {
  return `${eventKey}_${compLevel}${matchNumber}`;
};

// Parse match number from match key
export const parseMatchKey = (matchKey: string): {
  eventKey: string;
  compLevel: string;
  matchNumber: number;
} => {
  const parts = matchKey.split('_');
  if (parts.length !== 2) {
    throw new Error('Invalid match key format');
  }

  const eventKey = parts[0];
  const matchPart = parts[1];
  
  // Extract comp level (qm, sf, f, etc.) and match number
  const compLevelMatch = matchPart.match(/^([a-z]+)(\d+)$/);
  if (!compLevelMatch) {
    throw new Error('Invalid match key format');
  }

  const compLevel = compLevelMatch[1];
  const matchNumber = parseInt(compLevelMatch[2]);

  return { eventKey, compLevel, matchNumber };
};

// Validate TBA API key (simple test)
export const validateAPIKey = async (): Promise<boolean> => {
  try {
    // Try to get current year events as a test
    const currentYear = new Date().getFullYear();
    await makeTBARequest(`/events/${currentYear}/simple`);
    return true;
  } catch (error) {
    console.error('TBA API key validation failed:', error);
    return false;
  }
};

// Get event info by key
export const getEvent = async (eventKey: string): Promise<TBAEvent> => {
  return makeTBARequest(`/event/${eventKey}`) as Promise<TBAEvent>;
};
