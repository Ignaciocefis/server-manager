import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";

import { loginFormSchema } from "../../schemas";
import { z } from "zod";

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    const result = loginFormSchema.safeParse(values);

    if (!result.success) {
      toast.error("Valores inválidos");
      return;
    }

    const { email, password } = result.data;

    try {
      const { data: userActive } = await axios.post("/api/auth/isActive", {
        email,
      });

      if (!userActive?.isActive) {
        toast.error("Usuario inactivo, habla con un administrador para solicitar el alta de tu cuenta");
        return;
      }

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        toast.error("Email o contraseña incorrectos");
      } else {
        toast.success("Inicio de sesión exitoso");
        router.push(res.url || "/");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("Ha ocurrido un error inesperado");
    }
  };

  return {
    form,
    onSubmit,
  };
}
