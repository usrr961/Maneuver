import Button from "../ui/button";

interface InitialSelectTeamButtonProps {
  currentTeamType: string;
  currentTeamStatus: boolean;
  clickTeam: (teamType: string, teamStatus: boolean) => void;
  teamName?: string;
}

const InitialSelectTeamButton = ({
  currentTeamType,
  currentTeamStatus,
  clickTeam,
  teamName = "0000 - Team Name",
}: InitialSelectTeamButtonProps) => {
  return (
    <>
      <Button
        variant="outline"
        type="button"
        className="w-full h-full flex flex-row items-center text-xl pl-2"
        style={{
          // Set the background color to default background
          backgroundColor: `#${currentTeamStatus ? "393939" : "1B1B1D"}`,
        }}
        onClick={() => clickTeam(currentTeamType, currentTeamStatus)}
      >
        {teamName}
      </Button>
    </>
  );
};

export default InitialSelectTeamButton;
