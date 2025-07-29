import Dashboard from "@/pages/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';

const MainLayout = () => {
  return (
    <div className="flex bg-background h-screen w-screen flex-col justify-center items-center">
      <Dashboard />
      <Toaster />
      <PWAUpdatePrompt />
    </div>
  );
};

export default MainLayout;
