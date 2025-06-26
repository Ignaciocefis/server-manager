import { Category } from "@prisma/client";

export function getFullName(firstSurname?: string, secondSurname?: string, name?: string) {
  return `${firstSurname ?? ""} ${secondSurname ?? ""}, ${name ?? ""}`.trim();
}

export function getCategory(category: Category) {
  const categoryMap: Record<Category, string> = {
    ADMIN: "Administrador",
    RESEARCHER: "Investigador",
    JUNIOR: "Júnior",
  };
  return categoryMap[category] ?? category;
}