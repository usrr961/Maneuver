import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Users, UserPlus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useScouterManagement } from '@/hooks/useScouterManagement';
import { toast } from "sonner";

export const ScouterManagementSection: React.FC = () => {
  const { scoutersList, saveScouter, removeScouter } = useScouterManagement();
  const [newScouterName, setNewScouterName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddScouter = async () => {
    if (!newScouterName.trim()) {
      toast.error('Please enter a scouter name');
      return;
    }

    if (scoutersList.includes(newScouterName.trim())) {
      toast.error('Scouter already exists');
      return;
    }

    setIsAdding(true);
    try {
      await saveScouter(newScouterName.trim());
      setNewScouterName('');
      toast.success(`Added scouter: ${newScouterName.trim()}`);
    } catch (error) {
      console.error('Error adding scouter:', error);
      toast.error('Failed to add scouter');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveScouter = async (scouterName: string) => {
    try {
      await removeScouter(scouterName);
      toast.success(`Removed scouter: ${scouterName}`);
    } catch (error) {
      console.error('Error removing scouter:', error);
      toast.error('Failed to remove scouter');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddScouter();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Scouter Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add New Scouter */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter scouter name or initials..."
              value={newScouterName}
              onChange={(e) => setNewScouterName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleAddScouter}
              disabled={isAdding || !newScouterName.trim()}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Current Scouters List */}
          {scoutersList.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No scouters added yet. Add scouters above to create pit assignments.
                <br />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Since pit scouting happens before competition, you can add temporary names/initials here.
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Available Scouters ({scoutersList.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {scoutersList.map((scouter) => (
                  <div
                    key={scouter}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border"
                  >
                    <span className="text-sm font-medium">{scouter}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveScouter(scouter)}
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scoutersList.length > 0 && (
            <div className="text-xs text-muted-foreground">
              💡 Tip: Teams will be divided into blocks among scouters. More scouters = smaller blocks per person.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
