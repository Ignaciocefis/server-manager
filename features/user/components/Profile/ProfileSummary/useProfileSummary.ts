import { useEffect, useState } from "react";
import axios from "axios";
import { UserSummary } from "@/features/user/types";
import { toast } from "sonner";

export function useCurrentUser(open: boolean) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    await axios.get("/api/auth/me")
    .then((res) => {
      if (!res.data.success) {
        console.error("Error al obtener el usuario:", res.data.error);
        toast.error(res.data.message || "Error al cambiar el estado del usuario");
        return;
      }
      setUser(res.data.data);
    }).catch((error) => {
      console.error("Error al obtener el usuario:", error);
      toast.error("Error al obtener el usuario");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!open) fetchUser();
  }, [open]);

  return { user, loading, refetch: fetchUser };
}
