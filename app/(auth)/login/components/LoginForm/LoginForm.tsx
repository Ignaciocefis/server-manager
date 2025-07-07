"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInSchema } from "@/lib/schemas/auth/login.schema";

import { formSchema } from "./LoginForm.form";
import axios from "axios";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = signInSchema.safeParse(values);

    if (!result.success) {
      toast.error("Valores inválidos");
      return;
    }

    const { email, password } = result.data;

    try {
      const userActiveResponse = await axios.post("/api/auth/active/isActive", {
        email,
      });

      if (userActiveResponse.data.isActive === false) {
        toast.error(
          "Usuario inactivo, habla con un administrador para solicitar el alta de tu cuenta"
        );
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
    } catch (err) {
      console.error(err);
      toast.error("Ha ocurrido un error inesperado");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-1/3 gap-4 flex flex-col text-gray-app-600"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Correo corporativo</FormLabel>
              <FormControl>
                <Input
                  placeholder="ejemplo@alumn.us.es"
                  {...field}
                  className="bg-gray-app-100"
                  autoComplete="email"
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  className="bg-gray-app-100"
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-gray-app-600 text-white hover:bg-gray-app-500"
        >
          Iniciar sesión
        </Button>
      </form>
    </Form>
  );
}
