# Manual de instalación y despliegue

## Server Manager

**Versión del documento:** 1.0
**Proyecto:** Server Manager
**Repositorio:** https://github.com/Ignaciocefis/server-manager

Este manual describe la puesta en marcha real del proyecto tal y como está en este repositorio. Prioriza una instalación local reproducible y deja claro qué partes dependen de servicios externos como PostgreSQL, NextAuth y Resend.

## 1. Alcance

En esta guía encontrarás:

- Requisitos previos.
- Clonado e instalación del proyecto.
- Creación manual del archivo `.env`.
- Configuración de PostgreSQL y Prisma.
- Ejecución del seed inicial.
- Arranque local y verificación básica.
- Recomendaciones para despliegue en producción con Vercel.

## 2. Arquitectura general

Server Manager usa una arquitectura full-stack sobre Next.js.

| Componente | Tecnología |
| --- | --- |
| Frontend | Next.js 15 + React 19 |
| Backend | Route Handlers y Server Actions de Next.js |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Autenticación | NextAuth v5 |
| Emails | Resend |
| Testing | Jest |
| Despliegue | Vercel |

## 3. Requisitos previos

Antes de empezar, verifica que tienes instalado lo siguiente:

| Herramienta | Versión recomendada | Nota |
| --- | --- | --- |
| Node.js | 20 o superior | Recomendado LTS |
| pnpm | Última estable | Gestor de paquetes del proyecto |
| PostgreSQL | 16 o superior | Local o remoto |
| Git | Última estable | Para clonar el repositorio |

Comprobación rápida:

```bash
node --version
pnpm --version
psql --version
git --version
```

## 4. Obtener el código

```bash
git clone https://github.com/Ignaciocefis/server-manager.git
cd server-manager
```

## 5. Instalar dependencias

Instala las dependencias del proyecto:

```bash
pnpm install
```

El proyecto ejecuta `prisma generate` en `postinstall`, así que el cliente de Prisma se genera automáticamente al terminar la instalación.

Si vas a ejecutar el seed con `pnpm exec tsx prisma/seed.ts`, instala también `tsx` como dependencia de desarrollo:

```bash
pnpm add -D tsx
```

## 6. Crear el archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables.

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

AUTH_SECRET=coloca_aqui_un_secreto_largo_y_aleatorio

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/server_manager
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=server_manager

RESEND_API_KEY=
EMAIL_FROM=Server Manager <no-reply@tu-dominio.com>

SEED_USER_PASSWORD=admin123
```

Generación recomendada de `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

En Windows, si no tienes `openssl`, puedes usar:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 7. Preparar PostgreSQL

Si vas a usar una base de datos local, crea primero la base que referencia tu `DATABASE_URL`.

```bash
psql -U postgres
```

Dentro de PostgreSQL:

```sql
CREATE DATABASE server_manager;
\l
\q
```

Si ya tienes una base remota, reemplaza `DATABASE_URL` por la cadena de conexión real y omite este paso.

## 8. Aplicar migraciones

Con la base de datos accesible, crea la estructura inicial:

```bash
pnpm prisma migrate dev --name init
```

En entornos donde ya existan migraciones creadas y solo quieras aplicarlas, puedes usar:

```bash
pnpm prisma migrate deploy
```

## 9. Generar el cliente de Prisma

Normalmente ya queda generado por el `postinstall`, pero puedes forzarlo manualmente si lo necesitas:

```bash
pnpm prisma generate
```

## 10. Cargar datos iniciales

Ejecuta el seed para crear usuarios, servidores, GPUs, permisos y datos de ejemplo:

```bash
pnpm exec tsx prisma/seed.ts
```

El seed crea, entre otros, estos usuarios de prueba:

- `admin@example.com`
- `researcher@example.com`
- `junior@example.com`

La contraseña usada por el seed será el valor de `SEED_USER_PASSWORD`. Si no la defines, el script generará un hash para `defaultPassword`.

## 11. Ejecutar la aplicación en local

Arranca el entorno de desarrollo:

```bash
pnpm dev
```

La aplicación quedará disponible en:

```text
http://localhost:3000
```

## 12. Verificación básica

Después de arrancar la aplicación, comprueba lo siguiente:

1. La página de login carga sin errores.
2. Puedes iniciar sesión con una cuenta del seed.
3. El panel principal muestra datos de ejemplo.
4. Las rutas protegidas redirigen correctamente si no hay sesión.

Si algo falla, revisa primero `DATABASE_URL`, `AUTH_SECRET` y `RESEND_API_KEY`.

## 13. Configuración de NextAuth

NextAuth usa `AUTH_SECRET` para firmar la sesión. Debe ser un valor largo, aleatorio y distinto en cada entorno.

Buenas prácticas:

- No reutilices el mismo secreto entre desarrollo y producción.
- Regenera el secreto si sospechas que ha sido expuesto.
- Asegúrate de que la URL pública del entorno coincida con `NEXT_PUBLIC_APP_URL`.

## 14. Configuración de Resend

Para el envío de correos, configura Resend con el dominio real que vayas a usar.

Pasos recomendados:

1. Crea una cuenta en Resend.
2. Verifica el dominio desde su panel.
3. Añade los registros DNS que te indique Resend.
4. Copia la API key en `RESEND_API_KEY`.
5. Ajusta `EMAIL_FROM` y `EMAIL_USER` para que coincidan con el dominio verificado.

Ejemplo de variables:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxx
EMAIL_FROM=Server Manager <no-reply@tu-dominio.com>
EMAIL_USER=no-reply@tu-dominio.com
```

## 15. Despliegue en producción

La vía más directa es Vercel.

### Variables a configurar en Vercel

- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_USER`
- `SEED_USER_PASSWORD` solo si vas a volver a sembrar datos en ese entorno

### Flujo recomendado

1. Conecta el repositorio a Vercel.
2. Configura las variables de entorno en el proyecto.
3. Asegúrate de que la base de datos de producción está creada y accesible.
4. Ejecuta las migraciones contra la base real.
5. Despliega la aplicación.

No ejecutes el seed en producción salvo que quieras crear explícitamente datos de prueba.

## 16. Scripts útiles

Estos son los scripts más relevantes del repositorio:

| Script | Uso |
| --- | --- |
| `pnpm dev` | Arranca el entorno local |
| `pnpm build` | Genera la build de producción |
| `pnpm start` | Ejecuta la build compilada |
| `pnpm lint` | Revisa linting |
| `pnpm test` | Ejecuta la suite de tests |
| `pnpm test:ci` | Ejecuta tests con cobertura |
| `pnpm reset-db` | Resetea la base de datos de desarrollo |

## 17. Problemas frecuentes

- Si `pnpm exec tsx prisma/seed.ts` falla, confirma que `tsx` está instalado en el proyecto.
- Si Prisma no conecta, revisa que `DATABASE_URL` apunte a una base existente y accesible.
- Si el login falla, verifica `AUTH_SECRET` y que el seed se haya ejecutado correctamente.
- Si el correo no sale, revisa `RESEND_API_KEY` y el dominio verificado en Resend.

## 18. Resumen rápido

Si quieres una secuencia mínima, usa este orden:

```bash
pnpm install
pnpm add -D tsx
# crear .env manualmente
pnpm prisma migrate dev --name init
pnpm prisma generate
pnpm exec tsx prisma/seed.ts
pnpm dev
```