import { useEffect, useState } from "react";
import axios from "axios";
import { UserSummary } from "@/features/user/types";
import { handleApiError } from "@/lib/services/errors/errors";

export function useCurrentUser(open: boolean) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    await axios.get("/api/auth/me")
      .then((res) => {
        setUser(res.data.data);
      }).catch((error) => {
        handleApiError(error, true);
      }).finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!open) fetchUser();
  }, [open]);

  return { user, loading, refetch: fetchUser };
}
