import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserProfileSchema } from "@/features/user/schemas";
import z from "zod";
import { UserSummary } from "@/features/user/types";
import { useLanguage } from "@/hooks/useLanguage";

export function useProfileForm(user: UserSummary) {

  const { t } = useLanguage();

  const schema = updateUserProfileSchema(t);

  return useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
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
