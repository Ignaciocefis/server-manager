"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { ConfirmDialogProps, ConfirmMessageKey } from "./ConfirmDialog.types";
import { confirmMessages } from "./ConfirmDialog.utils";
import { useLanguage } from "@/hooks/useLanguage";

export function ConfirmDialog<K extends ConfirmMessageKey>({
  open,
  onClose,
  onConfirm,
  messageKey,
  params,
}: ConfirmDialogProps<K>) {
  const { t } = useLanguage();

  const messages = confirmMessages(t);

  const { title, description, confirmLabel, iconType } =
    messages[messageKey](params);

  const iconMap = {
    warning: { component: AlertTriangle, color: "text-yellow-app" },
    error: { component: XCircle, color: "text-red-app" },
    info: { component: Info, color: "text-green-app" },
  };

  const Icon = iconMap[iconType].component;
  const iconColor = iconMap[iconType].color;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl shadow-xl border border-gray-200">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <Icon className={`w-9 h-9 ${iconColor}`} />
            <span>{title}</span>
          </DialogTitle>

          <DialogDescription asChild>
            <div className="flex flex-col gap-2 text-gray-600 text-base leading-relaxed">
              <p className="text-gray-app-500">{description}</p>
              <p className="text-sm text-gray-500">
                {t("Shared.ConfirmDialog.confirm")}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-3 pt-6">
          <Button
            className={`px-5 py-2.5 rounded-lg font-semibold transition text-white shadow-md cursor-pointer ${
              iconType === "error"
                ? "bg-red-app hover:bg-red-700"
                : iconType === "warning"
                  ? "bg-yellow-app hover:bg-yellow-700"
                  : "bg-green-app hover:bg-green-700"
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-semibold cursor-pointer"
          >
            {t("Shared.ConfirmDialog.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
