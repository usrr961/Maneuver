// Types for pit assignment functionality

export interface PitAssignment {
  id: string;
  eventKey: string;
  teamNumber: number;
  scouterName: string;
  assignedAt: number;
  completed: boolean;
  notes?: string;
}

export interface PitAssignmentScouter {
  name: string;
  addedAt: number;
}

export type AssignmentMode = 'sequential' | 'manual';
