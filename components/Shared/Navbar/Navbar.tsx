import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationButton } from "@/components/Shared/NotificationButton";
import { ProfileSummary } from "@/components/Shared/ProfileSummary";

export function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 text-gray-app-600 bg-gray-app-100 h-18">
      <SidebarTrigger />
      <div className="flex items-center justify-between p-8">
        <NotificationButton />
        <ProfileSummary />
      </div>
    </div>
  );
}
