
import { useEffect } from "react";
import { ModeToggle } from "./mode-toggle"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
export function TopAppBar() {

    const handlePlayerStationChange = (value : string) => {
    const selectedStation = value;
    localStorage.setItem("playerStation", selectedStation);
    };

    useEffect(() => {
    const savedPlayerStation = localStorage.getItem("playerStation");
    if (savedPlayerStation) {
        const element = document.getElementById(savedPlayerStation.toLowerCase().replace(" ", ""));
        if (element) {
        (element as HTMLInputElement).checked = true;
        }
    }
    }, []);

    return (
        <div className="flex w-screen h-fit justify-between items-center py-6 px-20 bg-card text-card-foreground border-border border-b-2">
            <nav>
                <a className="text-4xl font-bold" href="/">FRC Jockey</a>
            </nav>
            <div className="flex gap-2">
                <Select
                    onValueChange={handlePlayerStationChange}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="red-1">Red 1</SelectItem>
                        <SelectItem value="red-2">Red 2</SelectItem>
                        <SelectItem value="red-3">Red 3</SelectItem>
                        <SelectItem value="blue-1">Blue 1</SelectItem>
                        <SelectItem value="blue-2">Blue 2</SelectItem>
                        <SelectItem value="blue-3">Blue 3</SelectItem>
                    </SelectContent>
                </Select>
                <ModeToggle/>
            </div>
            
        </div>
    )
}