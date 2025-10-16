"use client";

import axios from "axios";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UnreadNotification } from "@/features/eventLog/types";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/lib/services/errors/errors";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { TypeBadge } from "@/features/eventLog/components";
import { ConfirmDialog } from "@/components/Shared";

export function NotificationButton() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationList, setNotificationList] = useState<
    UnreadNotification[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const pathname = usePathname();
  const { t, tLog } = useLanguage();

  const fetchNotifications = async () => {
    await axios
      .get("/api/eventLogs/notificationList")
      .then((response) => {
        setNotificationList(response.data.data);
        setUnreadCount(response.data.data.length);
      })
      .catch((error) => {
        handleApiError(error, true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, [pathname]);

  const markAsRead = async (id: string) => {
    await axios
      .patch(`/api/eventLogs/notificationRead`, { id })
      .then(() => {
        if (id === "all") {
          setNotificationList([]);
          setUnreadCount(0);
          return;
        }

        setNotificationList((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => prev - 1);
      })
      .catch((error) => {
        handleApiError(error, true);
      });
  };

  const onConfirmMarkAll = () => {
    markAsRead("all");
    setConfirmOpen(false);
  };

  if (isLoading) {
    return <Skeleton className="h-6 w-6 rounded-full pl-4" />;
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <div className="relative flex items-center justify-center w-8 h-8 rounded-md mr-4 bg-gray-app-100 hover:bg-white transition-colors hover:cursor-pointer">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-app text-gray-app-100 text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </SheetTrigger>

        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-8 h-8 text-blue-app" />
              <SheetTitle className="text-2xl font-bold">
                {t("Shared.NotificationButton.title")}
              </SheetTitle>
            </div>
            <SheetDescription className="ml-10">
              {t("Shared.NotificationButton.description")}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 flex flex-col items-center w-full gap-2 overflow-y-auto">
            {notificationList.length > 0 ? (
              notificationList.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex justify-between items-start w-11/12 p-2 rounded-md border ${
                    notif.isRead ? "opacity-60" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <TypeBadge type={notif.eventType} />
                    <span className="text-sm">{tLog(notif.message)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => markAsRead(notif.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                {t("Shared.NotificationButton.noNotifications")}
              </span>
            )}
          </div>

          <SheetFooter>
            <Button
              className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer"
              onClick={() => setConfirmOpen(true)}
            >
              {t("Shared.NotificationButton.markAllAsRead")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onConfirmMarkAll}
        messageKey="markAllNotificationsRead"
        params={{ none: "" }}
      />
    </>
  );
}
