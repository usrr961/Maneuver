import ManeuverVerticalLogo from "../assets/Maneuver Wordmark Vertical.png";
import { cn } from "@/lib/utils";

const HomePage = () => {
  return (
    <main className="overflow-hidden h-screen w-full">
      <div
        className={cn(
          "flex flex-col h-full w-full justify-center items-center gap-6 pt-[var(--header-height)]",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      >
        <div className="flex flex-col w-auto justify-center items-center gap-6 scale-75 md:scale-100 lg:scale-150">
          <img
            src={ManeuverVerticalLogo}
            className="dark:invert"
          />
          <p className="text-center">
            <strong>Version</strong>: 2025.1.0
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute mt-7 top-[var(--header-height)] left-0 right-0 bottom-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)] dark:bg-black"></div>
    </main>
  );
};

export default HomePage;
