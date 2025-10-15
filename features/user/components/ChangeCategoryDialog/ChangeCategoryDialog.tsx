"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

export interface ChangeCategoryDialogProps {
  userId: string;
  currentCategory: "ADMIN" | "RESEARCHER" | "JUNIOR";
  onUpdated: (newCategory: "ADMIN" | "RESEARCHER" | "JUNIOR") => void;
}

export function ChangeCategoryDialog({
  userId,
  currentCategory,
  onUpdated,
}: ChangeCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<"ADMIN" | "RESEARCHER" | "JUNIOR">(
    currentCategory
  );
  const [loading, setLoading] = useState(false);

  const { t, tLog } = useLanguage();

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await axios.put("/api/user/updateCategory", {
        userId,
        category,
      });

      const categoryName = t(`User.management.${category.toLowerCase()}`);
      toast.success(
        tLog(`User.management.categoryUpdatedSuccess|${categoryName}`)
      );

      onUpdated(category);
      setOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(t("User.management.categoryUpdatedError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer"
          disabled={loading}
        >
          <UserCog className="w-4 h-4 mr-1" />
          {t("User.management.editCategory")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <UserCog className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("User.management.editCategory")}
            </DialogTitle>
          </div>
          <DialogDescription className="md:ml-12 -ml-7">
            {t("User.management.editCategoryDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <Select
            value={category}
            onValueChange={(val) =>
              setCategory(val as "ADMIN" | "RESEARCHER" | "JUNIOR")
            }
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("User.management.selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">
                {t("User.management.admin")}
              </SelectItem>
              <SelectItem value="RESEARCHER">
                {t("User.management.researcher")}
              </SelectItem>
              <SelectItem value="JUNIOR">
                {t("User.management.junior")}
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-center mt-2 gap-2">
            <Button
              onClick={handleUpdate}
              disabled={loading || category === currentCategory}
              className="bg-green-app-100 text-gray-app-600 font-bold hover:bg-green-app shadow-md cursor-pointer w-40"
            >
              {loading
                ? t("User.management.saving")
                : t("User.management.saveChanges")}
            </Button>

            <Button
              onClick={() => setOpen(false)}
              disabled={loading}
              className="bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer w-40"
            >
              {t("User.management.cancelButton")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
