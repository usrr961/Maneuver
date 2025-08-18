import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import type { PitAssignment } from '@/lib/pitAssignmentTypes';
import { getScouterColor } from './scouterUtils';

interface ScouterSelectionBarProps {
  scoutersList: string[];
  assignments: PitAssignment[];
  assignmentMode: 'sequential' | 'spatial' | 'manual';
  assignmentsConfirmed: boolean;
  selectedScouterForAssignment?: string | null;
  onScouterSelectionChange?: (scouterName: string | null) => void;
  hasAssignments: boolean;
}

export const ScouterSelectionBar: React.FC<ScouterSelectionBarProps> = ({
  scoutersList,
  assignments,
  assignmentMode,
  assignmentsConfirmed,
  selectedScouterForAssignment,
  onScouterSelectionChange,
  hasAssignments
}) => {
  const handleScouterSelect = (scouterName: string) => {
    if (selectedScouterForAssignment === scouterName) {
      onScouterSelectionChange?.(null);
    } else {
      onScouterSelectionChange?.(scouterName);
    }
  };

  const isInteractive = assignmentMode === 'manual' && !assignmentsConfirmed;

  return (
    <div className="flex flex-wrap gap-2">
      {scoutersList.map((scouter, index) => {
        const scouterAssignments = assignments.filter(a => a.scouterName === scouter);
        const completedCount = scouterAssignments.filter(a => a.completed).length;
        const totalCount = scouterAssignments.length;
        const isSelected = isInteractive && selectedScouterForAssignment === scouter;
        
        return (
          <Button
            key={scouter}
            variant={isSelected ? "default" : "outline"}
            size="default"
            className={`${getScouterColor(index)} px-2 ${
              isInteractive
                ? `transition-all hover:scale-105 active:scale-95 ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
                  }` 
                : 'cursor-default'
            }`}
            title={
              isInteractive
                ? `${scouter} - ${totalCount} teams assigned - Click to select for assignment`
                : `${completedCount}/${totalCount} teams completed`
            }
            onClick={isInteractive ? () => handleScouterSelect(scouter) : undefined}
            disabled={false}
          >
            <div className="flex items-center gap-1">
              {isInteractive && (
                <Plus className="h-3 w-3" />
              )}
              <span>{scouter} ({hasAssignments ? totalCount : 0})</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
