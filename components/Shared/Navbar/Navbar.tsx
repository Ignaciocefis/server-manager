import { NotificationButton } from "@/components/Shared/NotificationButton";
import { ProfileSummary } from "@/components/Shared/Profile";
import { AppImage } from "../AppImage";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
          <ProfileSummary />
        </div>
      </div>
    </div>
  );
}
