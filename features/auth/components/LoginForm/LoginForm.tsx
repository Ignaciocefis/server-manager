"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLoginForm } from "./useLoginForm";
import { useLanguage } from "@/hooks/useLanguage";

export function LoginForm() {
  const { t } = useLanguage();

  const { form, onSubmit } = useLoginForm();
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-4/5 mx-auto gap-4 flex flex-col text-gray-app-600"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">{t.app.auth.email}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t.app.auth.exampleEmail}
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
              <div className="flex justify-between items-center">
                <FormLabel className="font-bold">
                  {t.app.auth.password}
                </FormLabel>
                <span className="text-sm text-gray-app-500 cursor-pointer hover:underline">
                  {t.app.auth.forgotPassword}
                </span>
              </div>
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
          className="bg-gray-app-600 text-white hover:bg-gray-app-500 cursor-pointer"
        >
          {t.app.auth.login}
        </Button>
      </form>
    </Form>
  );
}
