"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { ChangePassword } from "../ChangePassword/ChangePassword";
import { useProfileForm } from "./hooks/useProfileForm";
import { handleProfileUpdate } from "./ProfileSheet.handlers";
import { useAssignedResearcher } from "./hooks/useAssignedResearcher";
import { UserSummary } from "@/features/user/types";
import { useLanguage } from "@/hooks/useLanguage";
import { UserIcon } from "lucide-react";

export function ProfileSheet({ user }: { user: UserSummary }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const { t } = useLanguage();

  const form = useProfileForm(user);
  const { handleSubmit, reset, watch } = form;

  const category = watch("category");
  const assignedToId = watch("assignedToId");
  const researcherName = useAssignedResearcher(category, assignedToId ?? null);

  const onSubmit = handleSubmit((data) => {
    handleProfileUpdate(
      {
        ...data,
        id: user.id,
        secondSurname: data.secondSurname ?? null,
        assignedToId: data.assignedToId ?? null,
      },
      (updatedUser) => {
        reset({
          ...updatedUser,
          secondSurname: updatedUser.secondSurname ?? undefined,
          assignedToId: updatedUser.assignedToId ?? undefined,
        });
        setIsEditing(false);
      }
    );
  });

  return (
    <SheetContent side="right" className="w-[80vw] max-w-lg">
      <SheetHeader>
        <div className="flex items-center gap-2">
          <UserIcon className="w-8 h-8 text-blue-app" />
          <SheetTitle className="text-2xl font-bold">
            {t("User.ProfileSheet.title")}
          </SheetTitle>
        </div>
        <SheetDescription className="ml-10">
          {t("User.ProfileSheet.description")}
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditing) {
              onSubmit(e);
            }
          }}
          className="mt-6 flex flex-col items-center gap-4 text-gray-app-600"
        >
          {(
            ["name", "firstSurname", "secondSurname", "email"] as Array<
              "name" | "firstSurname" | "secondSurname" | "email"
            >
          ).map((fieldName) => (
            <div key={fieldName} className="w-11/12">
              <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(
                        fieldName === "name"
                          ? "User.ProfileSheet.name"
                          : fieldName === "firstSurname"
                            ? "User.ProfileSheet.firstSurname"
                            : fieldName === "secondSurname"
                              ? "User.ProfileSheet.secondSurname"
                              : "User.ProfileSheet.email"
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={fieldName === "email" ? "email" : "text"}
                        readOnly={!isEditing || fieldName === "email"}
                        className={`w-full px-3 py-2 rounded text-sm ${
                          fieldName === "email"
                            ? "bg-gray-app-100 text-gray-app-400"
                            : isEditing
                              ? "bg-white border border-gray-app-100"
                              : "bg-gray-app-100 text-gray-app-400"
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <div className="w-11/12">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("User.ProfileSheet.category")}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled
                      className="w-full bg-gray-app-100 text-gray-app-400 px-3 py-2 rounded text-sm border border-transparent"
                    >
                      <option value="ADMIN">
                        {t("User.ProfileSheet.admin")}
                      </option>
                      <option value="RESEARCHER">
                        {t("User.ProfileSheet.researcher")}
                      </option>
                      <option value="JUNIOR">
                        {t("User.ProfileSheet.junior")}
                      </option>
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {category === "JUNIOR" && researcherName && (
            <div className="w-11/12">
              <FormItem>
                <FormLabel>
                  {t("User.ProfileSheet.researcherAssigned")}
                </FormLabel>
                <div className="w-full bg-gray-app-100 text-gray-app-400 px-3 py-2 rounded text-sm border border-transparent">
                  {researcherName}
                </div>
              </FormItem>
            </div>
          )}

          <div className="w-11/12 mt-16 flex flex-col gap-4">
            {isEditing ? (
              <>
                <Button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    onSubmit(e);
                  }}
                  className="w-full bg-green-app-100 text-gray-app-600 font-bold hover:bg-green-app shadow-md cursor-pointer"
                >
                  {t("User.ProfileSheet.saveChanges")}
                </Button>
                <Button
                  type="button"
                  className="w-full bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer"
                  onClick={(e) => {
                    reset();
                    setIsEditing(false);
                    e.preventDefault();
                  }}
                >
                  {t("User.ProfileSheet.cancel")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  className="w-full bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditing(true);
                  }}
                >
                  {t("User.ProfileSheet.editProfile")}
                </Button>
                <Button
                  type="button"
                  className="w-full bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPasswordDialogOpen(true);
                  }}
                >
                  {t("User.ProfileSheet.changePassword")}
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>

      <ChangePassword
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </SheetContent>
  );
}
