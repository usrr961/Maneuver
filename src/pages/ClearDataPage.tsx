import Button from "@/components/ui/Button";

const ClearDataPage = () => {

  const handleClearMatchData = () => {
      localStorage.setItem("matchData", "");
  };

  const handleClearScoutData = () => {
      localStorage.setItem("scoutingData", JSON.stringify({ data: [] }));
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div className="h-full w-full overflow-none items-center justify-center">
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
      </div>
    </div>
  );
};

export default ClearDataPage;
