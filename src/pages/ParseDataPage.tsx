import ParseDataSelector from "@/components/ParseDataComponents/ParseDataSelector";
const ParseDataPage = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center w-full h-full overflow-auto bg-background  pt-[var(--header-height)]">
      <div className="flex flex-col w-full justify-center items-center whitespace-pre-wrap break-word">
        <p className="text-center text-muted-foreground pb-4">
          Select scouting data JSONs and upload the files here.
        </p>
      </div>
      <ParseDataSelector />
    </main>
  );
};

export default ParseDataPage;
