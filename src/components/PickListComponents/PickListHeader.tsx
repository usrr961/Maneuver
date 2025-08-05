import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

interface PickListHeaderProps {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PickListHeader = ({ onExport, onImport }: PickListHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-muted-foreground">Create and manage alliance selection pick lists</p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <input
          type="file"
          accept=".json"
          onChange={onImport}
          style={{ display: 'none' }}
          id="import-input"
        />
        <Button 
          onClick={() => document.getElementById('import-input')?.click()} 
          variant="outline" 
          size="sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
      </div>
    </div>
  );
};
