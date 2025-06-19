import { Binoculars, Download, Settings, House } from "lucide-react"
import NavigationButton from "./NavigationButton"


export function BottomNav() {

    return (
        <nav className="flex w-screen h-fit justify-between items-center py-4 px-20 bg-card text-card-foreground border-border border-t-2">
            <NavigationButton variant={"ghost"} destination="/">
                <div className="flex flex-col items-center">
                    <House className="size-8" />
                    <span>Home</span>
                </div>
            </NavigationButton>
            <NavigationButton variant={"ghost"} destination="/settings">
                <div className="flex flex-col items-center">
                    <Binoculars className="size-8" />
                    <span>Scout</span>
                </div>
            </NavigationButton>
            <NavigationButton variant={"ghost"} destination="/settings">
                <div className="flex flex-col items-center">
                    <Download className="size-8" />
                    <span>Dump Data</span>
                </div>
            </NavigationButton>
            <NavigationButton variant={"ghost"} destination="/settings">
                <div className="flex flex-col items-center">
                    <Settings className="size-8" />
                    <span>Settings</span>
                </div>
            </NavigationButton>
        </nav>
    )
}