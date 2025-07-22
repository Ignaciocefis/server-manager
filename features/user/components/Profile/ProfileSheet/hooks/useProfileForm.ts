import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserProfileSchema } from "@/features/user/schemas";
import z from "zod";
import { UserSummary } from "@/features/user/types";

export function useProfileForm(user: UserSummary) {
  return useForm<z.infer<typeof updateUserProfileSchema>>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name: user.name,
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname || "",
      email: user.email,
      category: user.category,
      assignedToId: user.assignedToId || null,
    },
  });
}
