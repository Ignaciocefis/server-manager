import { notFound } from "next/navigation";
import SwaggerPageClient from "./SwaggerPageClient";

export default function SwaggerPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <SwaggerPageClient />;
}
