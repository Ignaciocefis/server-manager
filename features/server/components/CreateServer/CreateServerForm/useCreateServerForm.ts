"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createServerFormSchema } from "@/features/server/shemas";
import { submitServer } from "./CreateServerForm.handlers";

export const useCreateServerForm = (closeDialog?: () => void) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof createServerFormSchema>>({
    resolver: zodResolver(createServerFormSchema),
    defaultValues: {
      name: "",
      ramGB: 1,
      diskCount: 1,
      gpus: [{ name: "", type: "", ramGB: 1 }],
    },
  });

  const onSubmit = (data: z.infer<typeof createServerFormSchema>) =>
    submitServer(data, router, closeDialog);

  return { form, onSubmit };
};
