import ManeuverVerticalLogo from "../assets/Maneuver Wordmark Vertical.png";

const HomePage = () => {
  return (
    <main className="overflow-auto h-full w-full">
      <div className="flex flex-col h-full w-full justify-center items-center py-8 px-8 gap-6">
        <div className="flex flex-col w-auto h-full justify-center items-center gap-6 scale-150 pb-48">
          <img
            src={ManeuverVerticalLogo}
            className="dark:invert"
          />
          <p className="text-center row-span-1">
            <strong>Version</strong>: 2.0.0
          </p>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
