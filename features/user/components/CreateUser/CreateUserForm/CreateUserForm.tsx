"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { DialogClose } from "@radix-ui/react-dialog";
import { CircleMinus, CirclePlus } from "lucide-react";
import { useWatch } from "react-hook-form";

import { ComboboxResearchers } from "@/components/Shared/FormItems/ComboboxResearchers/ComboboxResearchers";
import { handleCreateUser } from "./CreateUserForm.handlers";
import { CreateUserFormProps } from "./CreateUserForm.types";
import { useCreateUserForm } from "./hooks/useCreateUserForm";
import { useFetchResearchers } from "./hooks/useFetchResearchers";
import { useLanguage } from "@/hooks/useLanguage";

export function CreateUserForm({
  closeDialog,
  onSuccess,
}: CreateUserFormProps) {
  const { t } = useLanguage();

  const { form } = useCreateUserForm();

  const selectedCategory = useWatch({
    control: form.control,
    name: "category",
  });

  const { researchers } = useFetchResearchers(selectedCategory);

  const onSubmit = form.handleSubmit((data) =>
    handleCreateUser(data, onSuccess, closeDialog)
  );

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  {t("User.management.email")}
                </FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("User.management.name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstSurname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("User.management.firstSurname")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secondSurname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("User.management.secondSurname")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  {t("User.management.category")}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="JUNIOR">
                      {t("User.management.junior")}
                    </SelectItem>
                    <SelectItem value="RESEARCHER">
                      {t("User.management.researcher")}
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      {t("User.management.admin")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCategory === "JUNIOR" && (
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("User.management.assignResearcher")}</FormLabel>
                  <FormControl>
                    <ComboboxResearchers
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      researchers={researchers}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="md:col-span-2 flex justify-center gap-4 mt-4">
          <Button
            type="submit"
            className="bg-green-app-100 text-gray-app-600 font-bold hover:bg-green-app shadow-md cursor-pointer w-40"
          >
            <CirclePlus />
            {t("User.management.createUserButton")}
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              className="w-40 bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer"
            >
              <CircleMinus />
              {t("User.management.cancelButton")}
            </Button>
          </DialogClose>
        </div>
      </form>
    </Form>
  );
}
