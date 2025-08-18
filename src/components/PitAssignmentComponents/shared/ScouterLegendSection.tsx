import React from 'react';
import { ScouterSelectionBar } from './ScouterSelectionBar';
import { AssignmentProgressBar } from './AssignmentProgressBar';
import { AssignmentActionButtons } from './AssignmentActionButtons';
import type { PitAssignment } from '@/lib/pitAssignmentTypes';

interface ScouterLegendSectionProps {
  scoutersList: string[];
  assignments: PitAssignment[];
  assignmentMode: 'sequential' | 'spatial' | 'manual';
  assignmentsConfirmed: boolean;
  selectedScouterForAssignment?: string | null;
  onScouterSelectionChange?: (scouterName: string | null) => void;
  onClearAllAssignments?: () => void;
  onConfirmAssignments?: () => void;
  hasAssignments: boolean;
  showMobileActions?: boolean;
  helpText?: string;
}

export const ScouterLegendSection: React.FC<ScouterLegendSectionProps> = ({
  scoutersList,
  assignments,
  assignmentMode,
  assignmentsConfirmed,
  selectedScouterForAssignment,
  onScouterSelectionChange,
  onClearAllAssignments,
  onConfirmAssignments,
  hasAssignments,
  showMobileActions = false,
  helpText
}) => {
  return (
    <div className="mb-4 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">
          {assignmentMode === 'manual' && !assignmentsConfirmed ? 'Scouters (Click to Select):' : 'Assignment Legend:'}
        </div>
        <div className="text-xs text-muted-foreground">
          {scoutersList.length} scouters
        </div>
      </div>

      <div className="mb-3">
        <ScouterSelectionBar
          scoutersList={scoutersList}
          assignments={assignments}
          assignmentMode={assignmentMode}
          assignmentsConfirmed={assignmentsConfirmed}
          selectedScouterForAssignment={selectedScouterForAssignment}
          onScouterSelectionChange={onScouterSelectionChange}
          hasAssignments={hasAssignments}
        />
      </div>

      {/* Progress Bar - inside the scouter selection card */}
      {hasAssignments && (
        <div className="mt-3 p-3">
          <AssignmentProgressBar assignments={assignments} />
          
          {/* Mobile Actions */}
          {showMobileActions && (
            <div className="md:hidden mt-3">
              <AssignmentActionButtons
                assignmentMode={assignmentMode}
                assignmentsConfirmed={assignmentsConfirmed}
                assignmentsLength={assignments.length}
                onClearAllAssignments={onClearAllAssignments}
                onConfirmAssignments={onConfirmAssignments}
                isMobile={true}
              />
            </div>
          )}
        </div>
      )}
      
      {helpText && (
        <div className="text-xs text-muted-foreground pt-4">
          {helpText}
        </div>
      )}
    </div>
  );
};
