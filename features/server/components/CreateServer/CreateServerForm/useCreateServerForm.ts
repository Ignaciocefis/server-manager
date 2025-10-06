"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createServerFormSchema } from "@/features/server/shemas";
import { submitServer } from "./CreateServerForm.handlers";
import { useLanguage } from "@/hooks/useLanguage";

export const useCreateServerForm = (closeDialog?: () => void) => {
  const router = useRouter();

  const { t } = useLanguage();

  const schema = createServerFormSchema(t);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      ramGB: 1,
      diskCount: 1,
      gpus: [{ name: "", type: "", ramGB: 1 }],
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) =>
    submitServer(data, router, closeDialog);

  return { form, onSubmit };
};
