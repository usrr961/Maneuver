import ParseDataSelector from "@/components/ParseDataComponents/ParseDataSelector";

const ParseDataPage = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center w-full h-full overflow-auto bg-background">
      <div className="flex flex-col w-full justify-center items-center whitespace-pre-wrap break-word">
        <h2 className="text-white font-bold text-2xl text-center p-8">
          Select scouting data JSONs and upload the files here.
        </h2>
      </div>
      <ParseDataSelector />
    </main>
  );
};

export default ParseDataPage;
