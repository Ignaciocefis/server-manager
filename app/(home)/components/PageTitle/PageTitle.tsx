"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageTitleProps } from "./PageTitle.types";

export function PageTitle({
  title,
  dialogAction,
  secondaryAction,
  children,
}: PageTitleProps) {
  return (
    <div className="bg-gray-app-100 rounded-xl px-8 py-4 m-4 w-11/12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-app-600">{title}</h1>

        <div className="flex items-center gap-2">
          {children && <div className="mr-4">{children}</div>}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              className="flex gap-2 items-center"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}

          {dialogAction && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex gap-2 items-center">
                  {dialogAction.icon}
                  {dialogAction.label}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{dialogAction.label}</DialogTitle>
                </DialogHeader>
                {dialogAction.content}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
