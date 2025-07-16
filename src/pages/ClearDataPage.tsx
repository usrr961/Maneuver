import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ClearDataPage = () => {

  const handleClearMatchData = () => {
      localStorage.setItem("matchData", "");
      toast.success("Cleared Match Data");
  };

  const handleClearScoutData = () => {
      localStorage.setItem("scoutingData", JSON.stringify({ data: [] }));
      toast.success("Cleared Scouting Data");
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full flex justify-center",
        "[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
      )}
    >
      <div className="flex flex-col gap-4 py-16">
        <Button
          type="button"
          className="flex w-full max-w-sm lg:max-w-lg h-16 items-center justify-center p-4 text-xl text-center whitespace-normal break-words px-6"
          onClick={() => handleClearMatchData()}
        >
          Clear Match Schedule Data
        </Button>
        <Button
          type="button"
          className="flex w-full max-w-sm lg:max-w-lg h-16 items-center justify-center p-4 text-xl text-center whitespace-normal break-words px-6"
          onClick={() => handleClearScoutData()}
        >
          Clear Collected Scouting Data
        </Button>
      </div>
    </div>
  );
};

export default ClearDataPage;
