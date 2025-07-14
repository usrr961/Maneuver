import { useEffect, useState, type JSX } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface InitialSelectAllianceProps {
  currentAlliance: string;
  setAlliance: (alliance: string | null) => void;
}

const InitialSelectAlliance = ({ currentAlliance, setAlliance }: InitialSelectAllianceProps): JSX.Element => {
  const [redSelected, setRedSelected] = useState(currentAlliance === "redAlliance");
  const [blueSelected, setBlueSelected] = useState(currentAlliance === "blueAlliance");

  /**
   * Click handler for the alliance selection.
   * @param {string} alliance - The alliance to select.
   */
  const clickAlliance = (alliance: string) => {
    if (alliance === "red") {
      setRedSelected(!redSelected);
      setBlueSelected(false);
    } else if (alliance === "blue") {
      setBlueSelected(!blueSelected);
      setRedSelected(false);
    }
  };

  /**
   * Updates the alliance state based on the selected value.
   */
  useEffect(() => {
    if (redSelected && !blueSelected) {
      setAlliance("redAlliance");
    } else if (!redSelected && blueSelected) {
      setAlliance("blueAlliance");
    } else {
      setAlliance(null);
    }
  }, [redSelected, blueSelected, setAlliance]);

  return (
    <>
      <Card className="w-full h-full flex flex-col items-start justify-center">
        <CardHeader className="w-full text-2xl font-bold items-start">
          <CardTitle>Select Alliance</CardTitle>
        </CardHeader>
        <CardContent
          className="flex justify-between w-full gap-2">
          <button
            type="button"
            className="bg-red-600 rounded-xl h-20 flex-grow"
            style={{
              boxShadow: `0px 0px 0px ${redSelected ? "1rem #F7B900" : " 0.5rem #1D1E1E"} inset`,
            }}
            onClick={() => clickAlliance("red")}
          />
          <button
            type="button"
            className="bg-blue-600 rounded-xl h-20 flex-grow"
            style={{
              boxShadow: `0px 0px 0px ${blueSelected ? "1rem #F7B900" : "0.5rem #1D1E1E"} inset`,
            }}
            onClick={() => clickAlliance("blue")}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default InitialSelectAlliance;
