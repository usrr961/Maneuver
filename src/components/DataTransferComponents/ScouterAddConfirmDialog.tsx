import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ScouterAddConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingScouterNames: string[];
  onAddToSelectable: () => void;
  onImportOnly: () => void;
}

const ScouterAddConfirmDialog: React.FC<ScouterAddConfirmDialogProps> = ({
  open,
  onOpenChange,
  pendingScouterNames,
  onAddToSelectable,
  onImportOnly
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Scouters to Selectable List?</DialogTitle>
          <DialogDescription>
            The imported data contains {pendingScouterNames.length} scouter(s) that are not currently in your selectable scouter list: <strong>{pendingScouterNames.join(", ")}</strong>
            <br /><br />
            Would you like to add them to the selectable scouter list? This will make them available in the scouter selection dropdown.
            <br /><br />
            <strong>Choose "No" if you're a lead scout</strong> and want to control which scouters can be selected.
            <br />
            <strong>Choose "Yes" if you're setting up a new tablet</strong> and want these scouters to be selectable.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onImportOnly} className="px-2">
            No, Import Data Only
          </Button>
          <Button onClick={onAddToSelectable} className="px-2">
            Yes, Add to Selectable List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScouterAddConfirmDialog;
