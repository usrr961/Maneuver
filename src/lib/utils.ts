
// Default header row for scouting data export (update if your schema changes)
export const SCOUTING_DATA_HEADER = [
  "id","matchNumber","alliance","scouterInitials","selectTeam",
  "startPoses0","startPoses1","startPoses2","startPoses3","startPoses4","startPoses5",
  "autoCoralPlaceL1Count","autoCoralPlaceL2Count","autoCoralPlaceL3Count","autoCoralPlaceL4Count","autoCoralPlaceDropMissCount",
  "autoCoralPickPreloadCount","autoCoralPickStationCount","autoCoralPickMark1Count","autoCoralPickMark2Count","autoCoralPickMark3Count",
  "autoAlgaePlaceNetShot","autoAlgaePlaceProcessor","autoAlgaePlaceDropMiss","autoAlgaePlaceRemove",
  "autoAlgaePickReefCount","autoAlgaePickMark1Count","autoAlgaePickMark2Count","autoAlgaePickMark3Count",
  "autoPassedStartLine",
  "teleopCoralPlaceL1Count","teleopCoralPlaceL2Count","teleopCoralPlaceL3Count","teleopCoralPlaceL4Count","teleopCoralPlaceDropMissCount",
  "teleopCoralPickStationCount","teleopCoralPickCarpetCount",
  "teleopAlgaePlaceNetShot","teleopAlgaePlaceProcessor","teleopAlgaePlaceDropMiss","teleopAlgaePlaceRemove",
  "teleopAlgaePickReefCount","teleopAlgaePickCarpetCount",
  "shallowClimbAttempted","deepClimbAttempted","parkAttempted","climbFailed","playedDefense","brokeDown","comment"
];
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts an array of arrays (parsed JSON data) into a CSV string.
 * Each row is an array of values (strings or numbers).
 * Escapes quotes and joins with commas/newlines.
 *
 * @param {Array<Array<string|number>>} data - The data to convert to CSV.
 * @returns {string} The CSV string.
 */
export function convertArrayOfArraysToCSV(data: (string | number)[][]): string {
  return data
    .map((row) =>
      row
        .map((item) =>
          typeof item === "string"
            ? `"${item.replace(/"/g, '""')}"`
            : item
        )
        .join(",")
    )
    .join("\n");
}

export const convertTeamRole = (value: string | null) => {
      switch (value) {
        case "lead":
          return "Lead";
        case "red-1":
          return "Red 1";
        case "red-2":
          return "Red 2";
        case "red-3":
          return "Red 3";
        case "blue-1":
          return "Blue 1";
        case "blue-2":
          return "Blue 2";
        case "blue-3":
          return "Blue 3";
      }
      return "Role";
    };
