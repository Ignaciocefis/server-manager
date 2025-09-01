import { Badge } from "@/components/ui/badge";
import { Category } from "@prisma/client";
import { CATEGORY_TRANSLATIONS } from "./helpers";

export function getFullName(
  firstSurname?: string,
  secondSurname?: string,
  name?: string
) {
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

export const getServerBadge = (servers?: string[]) => {
  if (!servers || servers.length === 0) {
    return "-";
  }
  const rows = [];
  for (let i = 0; i < servers.length; i += 3) {
    rows.push(servers.slice(i, i + 3));
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex flex-wrap gap-2">
          {row.map((server) => (
            <Badge
              key={server}
              className="flex items-center px-2 py-1 text-xs rounded-lg font-bold gap-2 border bg-white"
              style={{
                borderColor: "var(--color-blue-app)",
                color: "var(--color-blue-app)",
                backgroundColor:
                  "color-mix(in srgb, var(--color-blue-app) 20%, white)",
              }}
            >
              <span>{server}</span>
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
};

export const getCategoryTypeBadge = (type: Category) => {
  const label = CATEGORY_TRANSLATIONS[type] ?? "Júnior";

  const colorMap = {
    ADMIN: "--color-red-app",
    RESEARCHER: "--color-yellow-app",
    JUNIOR: "--color-green-app",
  } as const;

  const colorVar = colorMap[type];

  return (
    <Badge
      className="flex items-center px-2 py-1 text-xs rounded-lg font-bold gap-2 border bg-white"
      style={{
        borderColor: `var(${colorVar})`,
        color: `var(${colorVar})`,
        backgroundColor: `color-mix(in srgb, var(${colorVar}) 20%, white)`,
      }}
    >
      {label}
    </Badge>
  );
};

export const getStatusTypeBadge = (status: boolean) => {
  const label = status ? "Activo" : "Inactivo";

  const colorMap = {
    true: "--color-green-app",
    false: "--color-yellow-app",
  } as const;

  const colorVar = colorMap[String(status) as "true" | "false"];

  return (
    <Badge
      className="flex items-center px-2 py-1 text-xs rounded-lg font-bold gap-2 border bg-white"
      style={{
        borderColor: `var(${colorVar})`,
        color: `var(${colorVar})`,
        backgroundColor: `color-mix(in srgb, var(${colorVar}) 20%, white)`,
      }}
    >
      {label}
    </Badge>
  );
};
