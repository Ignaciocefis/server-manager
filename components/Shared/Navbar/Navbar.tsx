import { NotificationButton } from "@/components/Shared/NotificationButton";
import { ProfileSummary } from "@/components/Shared/ProfileSummary";
import { AppImage } from "../AppImage";

export function Navbar() {
  return (
    <div className="flex items-center p-4 text-gray-app-600 bg-gray-app-100 h-18">
      <div className="flex items-center justify-between p-8 w-full">
        <AppImage width={100} height={45} />
        <div className="flex items-center gap-4">
          <NotificationButton />
          <ProfileSummary />
        </div>
      </div>
    </div>
  );
}
