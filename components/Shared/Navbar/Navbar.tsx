import { NotificationButton } from "@/components/Shared/NotificationButton";
import { ProfileSummary } from "@/components/Shared/ProfileSummary";
import { AppImage } from "../AppImage";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function Navbar() {
  return (
    <div className="flex items-center p-4 text-gray-app-600 bg-gray-app-100 h-18">
      <div className="flex items-center justify-between p-8 w-full">
        <div className="block md:hidden">
          <SidebarTrigger />
        </div>
        <AppImage width={100} height={45} />
        <div className="flex items-center md:gap-4">
          <NotificationButton />
          <Button
            className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-app-100 hover:bg-white transition-colors p-0 md:hidden"
            variant="ghost"
            size="icon"
          >
            <User className="w-4 h-4 text-gray-app-700" />
          </Button>
          <div className="hidden md:block">
            <ProfileSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
