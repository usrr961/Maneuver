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
        "h-full w-full overflow-none items-center justify-center",
        "[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
      )}
    >
      <div className="overflow-hidden flex flex-col items-center justify-center gap-4 py-16">
        <Button
          type="button"
          className="flex w-full max-w-1/2 h-16 items-center justify-center p-4 ~text-2xl/5xl text-center"
          onClick={() => handleClearMatchData()}
        >
          Clear Match Schedule Data
        </Button>
        <Button
          type="button"
          className="flex w-full max-w-1/2 h-16 items-center justify-center p-4 ~text-2xl/5xl text-center"
          onClick={() => handleClearScoutData()}
        >
          Clear Collected Scouting Data
        </Button>
      </div>
      <div className="pointer-events-none absolute mt-7 top-[var(--header-height)] left-0 right-0 bottom-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)] dark:bg-black"></div>
    </div>
  );
};

export default ClearDataPage;
