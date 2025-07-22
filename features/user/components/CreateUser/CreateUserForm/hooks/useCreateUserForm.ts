import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "@/features/user/schemas";
import { CreateUserFormData } from "../CreateUserForm.types";

export function useCreateUserForm() {
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
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
