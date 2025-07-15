import ParseDataSelector from "@/components/ParseDataComponents/ParseDataSelector";
import { cn } from "@/lib/utils";
const ParseDataPage = () => {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col items-center justify-center w-full h-full overflow-hidden bg-background",
        "[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
      )}
    >
      <div className="flex flex-col w-full justify-center items-center whitespace-pre-wrap break-word">
        <h2 className="text-white font-bold text-2xl text-center p-8">
          Plug the flash drives into the computer and upload the files here.
        </h2>
      </div>
      <ParseDataSelector />
      <div className="pointer-events-none absolute mt-7 top-[var(--header-height)] left-0 right-0 bottom-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)] dark:bg-black"></div>
    </main>
  );
};

export default ParseDataPage;
