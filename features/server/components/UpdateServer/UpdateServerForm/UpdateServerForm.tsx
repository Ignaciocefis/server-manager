"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { Save, CircleMinus } from "lucide-react";
import { useUpdateServerFormSchema } from "./hooks/useUpdateServerFormSchema";
import { useUpdateServerForm } from "./hooks/useUpdateServerForm";
import { UpdateServerFormProps } from "./UpdateServerForm.types";
import { GpuForm } from "@/features/gpu/components";
import { ConfirmDialog } from "@/components/Shared/ConfirmDialog/ConfirmDialog";
import { useLanguage } from "@/hooks/useLanguage";

export function UpdateServerForm({
  serverToEdit,
  closeDialog,
  onUpdate,
}: UpdateServerFormProps) {
  const form = useUpdateServerFormSchema(serverToEdit);
  const { update } = useUpdateServerForm({ onUpdate, closeDialog });

  const { t } = useLanguage();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<{
    serverId: string;
    name: string;
    ramGB: number;
    diskCount: number;
    available: boolean;
    gpus: {
      name: string;
      ramGB: number;
      type: string;
      status?: "PENDING" | "ACTIVE" | "EXTENDED" | "COMPLETED" | "CANCELLED";
      id?: string;
      userId?: string;
    }[];
  } | null>(null);

  if (!serverToEdit) return null;

  const handleSubmit = (data: {
    serverId: string;
    name: string;
    ramGB: number;
    diskCount: number;
    available: boolean;
    gpus: {
      name: string;
      ramGB: number;
      type: string;
      status?: "PENDING" | "ACTIVE" | "EXTENDED" | "COMPLETED" | "CANCELLED";
      id?: string;
      userId?: string;
    }[];
  }) => {
    setPendingData(data);
    setConfirmOpen(true);
  };

  const onConfirmUpdate = () => {
    if (pendingData) {
      update(pendingData);
      setPendingData(null);
    }
    setConfirmOpen(false);
  };

  return (
    <>
      <Form {...form}>
        <form
          key={serverToEdit.id}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8"
        >
          <input type="hidden" {...form.register("serverId")} />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  {t("Server.Edit.name")}
                </FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="ramGB"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RAM (GB)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diskCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Server.Edit.diskCount")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <GpuForm />

          <div className="flex justify-center gap-4 mt-4">
            <Button
              type="submit"
              className="w-40 bg-green-app hover:bg-green-app-transparent"
            >
              <Save className="mr-2" />
              {t("Server.Edit.button")}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                className="w-40 bg-red-app hover:bg-red-app-transparent"
              >
                <CircleMinus className="mr-2" />
                {t("Server.Edit.cancel")}
              </Button>
            </DialogClose>
          </div>
        </form>
      </Form>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onConfirmUpdate}
        messageKey="update_server"
        params={{
          name: pendingData?.name || serverToEdit.name,
        }}
      />
    </>
  );
}
