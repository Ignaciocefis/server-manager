import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "@/features/user/schemas";
import { CreateUserFormData } from "../CreateUserForm.types";
import { useLanguage } from "@/hooks/useLanguage";

export function useCreateUserForm() {
  const { t } = useLanguage();
  const schema = createUserSchema(t);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      name: "",
      firstSurname: "",
      secondSurname: "",
      category: "JUNIOR",
      assignedToId: "",
    },
  });

  return { form };
}
