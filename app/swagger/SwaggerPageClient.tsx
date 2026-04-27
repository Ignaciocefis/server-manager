"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import SwaggerUI from "swagger-ui-react";

const SWAGGER_STYLESHEET_URL =
  "https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css";

export default function SwaggerPageClient() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const linkId = "swagger-ui-external-stylesheet";

    if (document.getElementById(linkId)) return;

    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = SWAGGER_STYLESHEET_URL;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setAuthError(
        "No se pudo iniciar sesion. Revisa el email y la contrasena.",
      );
      return;
    }

    setPassword("");
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setAuthError(null);
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto w-full max-w-5xl px-4 py-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            Estado de sesion:{" "}
            {status === "loading"
              ? "cargando"
              : session?.user?.email
                ? `conectado como ${session.user.email}`
                : "sin sesion"}
          </p>

          {!session?.user ? (
            <form
              className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={handleSignIn}
            >
              <label className="flex w-full flex-col gap-1 text-sm text-slate-700">
                Email
                <input
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="flex w-full flex-col gap-1 text-sm text-slate-700">
                Contrasena
                <input
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              <button
                className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Iniciar sesion"}
              </button>
            </form>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <button
                className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
                type="button"
                onClick={handleSignOut}
              >
                Cerrar sesion
              </button>
            </div>
          )}

          {authError ? (
            <p className="mt-2 text-sm text-red-600">{authError}</p>
          ) : null}
        </div>
      </section>

      <SwaggerUI
        url="/api/openapi"
        deepLinking
        docExpansion="list"
        defaultModelsExpandDepth={-1}
        supportedSubmitMethods={[
          "get",
          "post",
          "put",
          "patch",
          "delete",
          "options",
          "head",
          "trace",
        ]}
      />
    </main>
  );
}
