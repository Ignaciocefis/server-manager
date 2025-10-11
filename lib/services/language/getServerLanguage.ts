import { cookies } from "next/headers";
import es from "@/locales/es.json";
import en from "@/locales/en.json";

export type Language = "es" | "en";
type Translations = typeof es;

function getTranslation(translations: Translations, path: string): string {
  const keys = path.split(".");
  let curr: unknown = translations;

  for (const key of keys) {
    if (typeof curr === "object" && curr !== null && key in (curr as Record<string, unknown>)) {
      curr = (curr as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof curr === "string" ? curr : path;
}

export async function getServerLanguage(): Promise<{
  language: Language;
  t: (path: string, params?: Array<string | number>) => string;
  tLog: (msg: string) => string;
}> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("language")?.value;
  const language: Language = cookieLang === "en" ? "en" : "es";

  const translations: Translations = language === "es" ? es : en;

  const t = (path: string, params?: Array<string | number>) => {
    let template = getTranslation(translations, path);
    if (params && params.length > 0) {
      template = template.replace(/\{(\d+)\}/g, (_, index) =>
        params[Number(index)]?.toString() ?? ""
      );
    }
    return template;
  };

  const tLog = (msg: string) => {
    if (!msg || !msg.includes("|")) return msg ?? "";
    const [key, ...params] = msg.split("|");
    return t(key, params);
  };

  return { language, t, tLog };
}
