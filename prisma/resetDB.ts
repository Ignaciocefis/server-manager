import { execSync } from "child_process";
import { rmSync } from "fs";
import { join } from "path";

const run = (cmd: string) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

try {
  const migrationsPath = join(__dirname, "migrations");
  rmSync(migrationsPath, { recursive: true, force: true });
  console.log("Carpeta /prisma/migrations eliminada.");

  run('pnpm prisma migrate reset --force');

  run('pnpm prisma generate');

  run('pnpm prisma migrate dev --name init');

  run('pnpm prisma db pull');

  run('pnpm prisma generate');

  run('pnpm tsx prisma/seed.ts');

  console.log("\nBase de datos reseteada y poblada.");
} catch (err) {
  console.error("Error en el script de reset:", err);
}
