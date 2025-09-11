"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { User as UserIcon } from "lucide-react";

import { ProfileSheet } from "../ProfileSheet/ProfileSheet";
import { getCategory, getFullName } from "@/features/user/utils";
import { useCurrentUser } from "./useProfileSummary";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSummary() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useCurrentUser(open);

  if (loading || !user)
    return (
      <div className="flex items-center justify-end gap-3 ml-6">
        <div className="hidden md:flex flex-col items-end leading-tight">
          <Skeleton className="h-4 w-32 mb-1 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    );

  const { name, category, firstSurname, secondSurname } = user;
  const fullName = getFullName(
    firstSurname ?? undefined,
    secondSurname ?? undefined,
    name ?? undefined
  );
  const userCategory = getCategory(category);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="hidden md:flex items-center gap-3 w-auto px-3 py-2"
          variant="ghost"
        >
          <div className="flex flex-col text-right leading-tight">
            <span className="font-medium text-sm">{fullName}</span>
            <span className="text-xs text-muted-foreground ">
              {userCategory}
            </span>
          </div>
          <UserIcon className="w-6 h-6 text-gray-app-700" />
        </Button>
      </SheetTrigger>

      <SheetTrigger asChild>
        <Button
          className="flex md:hidden items-center justify-center w-8 h-8 rounded-md bg-gray-app-100 hover:bg-white transition-colors p-0"
          variant="ghost"
          size="icon"
        >
          <UserIcon className="w-4 h-4 text-gray-app-700" />
        </Button>
      </SheetTrigger>

      <ProfileSheet user={user} />
    </Sheet>
  );
}
