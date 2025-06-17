//import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

import NavigationButton from "@/components/NavigationButton";
import { Separator } from "@/components/ui/separator";

const MatchDataPage = () => {
  return (
    <div className="w-full h-full">  
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <h1 className="text-white font-bold ~text-2xl/5xl text-center p-2">
            Load Match Data
          </h1>
          <h2 className="text-white font-bold ~text-1xl/4xl text-center p-2">
            Are You Online (Using QR Code) or Offline (Using Match Schedule File)?
          </h2>
        <div className="flex flex-col max-w-3/4 2xl:max-w-1/2 w-full h-full gap-4 px-4">
          <NavigationButton
            variant={"default"}
            destination={"/match-data/online"}
            className="h-16"
          >
            Online (QR Code)
          </NavigationButton>
          <Separator />
          <NavigationButton
            variant={"outline"}
            destination={"/match-data/offline"}
            className="h-16">
            Offline (Match Schedule File)
          </NavigationButton>
        </div>
      </div>
    </div>
  );
};

export default MatchDataPage;
