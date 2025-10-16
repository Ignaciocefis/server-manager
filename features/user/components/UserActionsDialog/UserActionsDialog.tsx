"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AssignResearcherDialog,
  AssignServersDialog,
  ChangeCategoryDialog,
} from "..";
import { toast } from "sonner";
import { UserRoundCheck, UserRoundMinus, Trash2, UserCog } from "lucide-react";
import { UserActionsDialogProps } from "./UserActionsDialog.types";
import { handleRefreshUsers } from "../UsersTable/UsersTable.helpers";
import {
  handleDeleteUser,
  handleToggleActive,
} from "../UsersTable/UsersTable.handlers";
import { useLanguage } from "@/hooks/useLanguage";
import { useHasCategory } from "@/hooks/useHasCategory";

export function UserActionsDialog({
  user,
  isAdmin,
  isResearcher,
  fetchUsers,
  pagination,
  searchTerm,
  sortField,
  sortOrder,
  openConfirmDialog,
}: UserActionsDialogProps) {
  const [open, setOpen] = useState(false);

  const { t, tLog } = useLanguage();
  const { hasCategory, userId } = useHasCategory("ADMIN");

  const refresh = async () =>
    handleRefreshUsers(
      fetchUsers,
      pagination,
      searchTerm,
      sortField,
      sortOrder as "desc" | "asc"
    );

  const isUserJunior = user.category === "JUNIOR";

  const handleToggle = () =>
    openConfirmDialog(
      async () => {
        await handleToggleActive(user.id);
        await refresh();
        setOpen(false);
      },
      "activate_user",
      {
        userName: user.userFullName,
        active: !user.isActive,
      }
    );

  const handleDelete = () =>
    openConfirmDialog(
      async () => {
        try {
          await handleDeleteUser(user.id);
          await refresh();
          setOpen(false);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error(t("User.management.deleteUserError"));
        }
      },
      "delete_user",
      { userName: user.userFullName }
    );

  const canOnlyAssignServers = isResearcher && !isAdmin;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setOpen(true)}
      >
        <UserCog className="h-4 w-4" />
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <UserCog className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("User.management.actionsTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="md:ml-12 -ml-7">
            {tLog(`User.management.actionsDescription|${user.userFullName}`)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          {canOnlyAssignServers ? (
            <AssignServersDialog
              userId={user.id}
              editorId={userId ?? ""}
              onAssigned={refresh}
            />
          ) : (
            <>
              {((isAdmin &&
                (user.category === "RESEARCHER" ||
                  user.category === "JUNIOR")) ||
                (isResearcher && user.category === "JUNIOR")) && (
                <AssignServersDialog
                  userId={user.id}
                  editorId={isAdmin ? (userId ?? "") : ""}
                  onAssigned={refresh}
                />
              )}

              {isUserJunior && isAdmin && (
                <AssignResearcherDialog
                  userId={user.id}
                  researcherId={
                    hasCategory
                      ? (userId ?? undefined)
                      : (user.assignedToId ?? undefined)
                  }
                  onAssigned={refresh}
                />
              )}

              <hr
                className={`${
                  user.category === "RESEARCHER" || user.category === "JUNIOR"
                    ? ""
                    : "hidden"
                } border-gray-app-300 w-4/5 mx-auto my-2`}
              />

              {isAdmin && (
                <ChangeCategoryDialog
                  userId={user.id}
                  currentCategory={user.category}
                  onUpdated={() => refresh()}
                />
              )}

              <hr className="border-gray-app-300 w-4/5 mx-auto my-2" />

              {isAdmin && user.category !== "ADMIN" && (
                <Button
                  onClick={handleToggle}
                  variant={user.isActive ? "outline" : "default"}
                  className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer"
                >
                  {user.isActive ? (
                    <>
                      <UserRoundMinus className="w-4 h-4" />
                      {t("User.management.deactivateUser")}
                    </>
                  ) : (
                    <>
                      <UserRoundCheck className="w-4 h-4" />
                      {t("User.management.activateUser")}
                    </>
                  )}
                </Button>
              )}

              {isAdmin && (
                <Button
                  onClick={handleDelete}
                  className="bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("User.management.deleteUser")}
                </Button>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex justify-end pt-4">
          <Button
            onClick={() => setOpen(false)}
            className="bg-gray-800 text-white hover:bg-gray-700"
          >
            {t("User.management.cancelButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
