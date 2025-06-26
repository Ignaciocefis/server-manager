"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { ProfileSheet } from "@/components/Shared/Profile";
import { User } from "lucide-react";
import { getCategory, getFullName } from "../Profile.utils";
import axios from "axios";

export function ProfileSummary() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleOpenChange = async (isOpen: boolean) => {
    if (!isOpen) {
      await fetchUser();
    }
    setOpen(isOpen);
  };

  if (!user) return <span>Cargando perfil...</span>;

  const { name, category, firstSurname, secondSurname } = user;
  const fullName = getFullName(firstSurname, secondSurname, name);
  const userCategory = getCategory(category);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          className="hidden md:flex items-center gap-3 w-auto px-3 py-2"
          variant="ghost"
        >
          <div className="flex flex-col text-right leading-tight">
            <span className="font-medium text-sm">{fullName}</span>
            <span className="text-xs text-muted-foreground">
              {userCategory}
            </span>
          </div>
          <User className="w-6 h-6 text-gray-app-700" />
        </Button>
      </SheetTrigger>

      <SheetTrigger asChild>
        <Button
          className="flex md:hidden items-center justify-center w-8 h-8 rounded-md bg-gray-app-100 hover:bg-white transition-colors p-0"
          variant="ghost"
          size="icon"
        >
          <User className="w-4 h-4 text-gray-app-700" />
        </Button>
      </SheetTrigger>

      <ProfileSheet user={user} />
    </Sheet>
  );
}
