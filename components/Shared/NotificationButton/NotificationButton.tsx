import { Bell } from "lucide-react";

export function NotificationButton() {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-app-100 pr-4 hover:bg-white transition-colors">
      <Bell className="w-4 h-4" />
    </div>
  );
}
