import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
