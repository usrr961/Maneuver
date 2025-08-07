import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface RobotPhotoSectionProps {
  robotPhoto: string | null;
  setRobotPhoto: (photo: string | null) => void;
}

export const RobotPhotoSection = ({ robotPhoto, setRobotPhoto }: RobotPhotoSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file is too large. Please choose a file under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setRobotPhoto(result);
        toast.success("Photo added successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setRobotPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Robot Photo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {robotPhoto ? (
            <div className="relative">
              <img 
                src={robotPhoto} 
                alt="Robot" 
                className="max-w-full max-h-64 rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removePhoto}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">No photo taken yet</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handlePhotoCapture} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              {robotPhoto ? "Change Photo" : "Add Photo"}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};
