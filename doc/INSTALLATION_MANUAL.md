# Manual de instalación y despliegue - Server Manager

> Guía paso a paso para instalar, configurar y desplegar el proyecto en entornos locales y de producción.

**Repositorio:** [https://github.com/Ignaciocefis/server-manager](https://github.com/Ignaciocefis/server-manager)

Este manual describe la puesta en marcha real del proyecto tal y como está en este repositorio. Prioriza una instalación local reproducible y deja claro qué partes dependen de servicios externos como PostgreSQL, NextAuth y Resend.

## Tabla de Contenidos

- [1. Arquitectura general](#1-arquitectura-general)
- [2. Requisitos previos](#2-requisitos-previos)
- [3. Obtener el código](#3-obtener-el-código)
- [4. Instalar dependencias](#4-instalar-dependencias)
- [5. Crear el archivo `.env`](#5-crear-el-archivo-env)
- [6. Preparar PostgreSQL](#6-preparar-postgresql)
- [7. Aplicar migraciones](#7-aplicar-migraciones)
- [8. Generar el cliente de Prisma](#8-generar-el-cliente-de-prisma)
- [9. Cargar datos iniciales](#9-cargar-datos-iniciales)
- [10. Configuración de NextAuth](#10-configuración-de-nextauth)
- [11. Configuración de Resend](#11-configuración-de-resend)
- [12. Ejecutar la aplicación en local](#12-ejecutar-la-aplicación-en-local)
- [13. Despliegue con Docker (método recomendado)](#13-despliegue-con-docker-método-recomendado)
- [14. Verificación básica](#14-verificación-básica)
- [15. Despliegue en producción](#15-despliegue-en-producción)
- [16. Scripts útiles](#16-scripts-útiles)
- [17. Problemas frecuentes](#17-problemas-frecuentes)
- [18. Resumen rápido](#18-resumen-rápido)

---

## 1. Arquitectura general

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

---

## 2. Requisitos previos

Antes de empezar, verifica que tienes instalado lo siguiente:

| Herramienta | Versión recomendada | Nota |
| --- | --- | --- |
| Node.js | 20 o superior | Recomendado LTS |
| pnpm | Última estable | Gestor de paquetes del proyecto |
| PostgreSQL | 16 o superior | Local o remoto |
| Git | Última estable | Para clonar el repositorio |

### Instalación de requisitos

#### Node.js

**Windows/macOS:**
- Descarga el instalador desde [nodejs.org](https://nodejs.org/)
- Selecciona la versión LTS (20.x o superior)
- Ejecuta el instalador y sigue las instrucciones

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verificar instalación:**
```bash
node --version
npm --version
```

#### PostgreSQL

**Windows:**
- Descarga el instalador desde [postgresql.org](https://www.postgresql.org/download/windows/)
- Ejecuta el instalador y sigue las instrucciones
- Recuerda la contraseña que configures para el usuario `postgres`

**macOS (con Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Verificar instalación:**
```bash
psql --version
```

#### pnpm

**Instalación global (recomendado):**
```bash
npm install -g pnpm
```

**Alternativa con instalador de script:**
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**Windows (PowerShell):**
```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

**Verificar instalación:**
```bash
pnpm --version
```

#### Git

**Windows/macOS:**
- Descarga el instalador desde [git-scm.com](https://git-scm.com/downloads)
- Ejecuta el instalador y sigue las instrucciones

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git
```

**Verificar instalación:**
```bash
git --version
```

---

## 3. Obtener el código

```bash
git clone https://github.com/Ignaciocefis/server-manager.git
cd server-manager
```

---

## 4. Instalar dependencias

Instala las dependencias del proyecto:

```bash
pnpm install
```

El proyecto ejecuta `prisma generate` en `postinstall`, así que el cliente de Prisma se genera automáticamente al terminar la instalación.

Si vas a ejecutar el seed con `pnpm exec tsx prisma/seed.ts`, instala también `tsx` como dependencia de desarrollo:

```bash
pnpm add -D tsx
```

---

## 5. Crear el archivo `.env`

Copia el archivo de ejemplo incluido en el repositorio:

```bash
cp .env.example .env
```

Edita el `.env` resultante y ajusta los valores a tu entorno. Las variables esenciales son:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

AUTH_SECRET=coloca_aqui_un_secreto_largo_y_aleatorio

# Para desarrollo local sin Docker, usa localhost:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/server_manager
# Para Docker Compose, el host es "db" (nombre del servicio):
# DATABASE_URL=postgresql://postgres:postgres@db:5432/app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=server_manager

RESEND_API_KEY=
EMAIL_FROM=Server Manager <no-reply@tu-dominio.com>

SEED_USER_PASSWORD=admin123
```

---

## 6. Preparar PostgreSQL

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

---

## 7. Aplicar migraciones

Con la base de datos accesible, crea la estructura inicial:

```bash
pnpm prisma migrate dev --name init
```

En entornos donde ya existan migraciones creadas y solo quieras aplicarlas, puedes usar:

```bash
pnpm prisma migrate deploy
```

---

## 8. Generar el cliente de Prisma

Normalmente ya queda generado por el `postinstall`, pero puedes forzarlo manualmente si lo necesitas:

```bash
pnpm prisma generate
```

---

## 9. Cargar datos iniciales

Ejecuta el seed para crear usuarios, servidores, GPUs, permisos y datos de ejemplo:

```bash
pnpm exec tsx prisma/seed.ts
```

El seed crea, entre otros, estos usuarios de prueba:

- `admin@example.com`
- `researcher@example.com`
- `junior@example.com`

La contraseña usada por el seed será el valor de `SEED_USER_PASSWORD`. Si no la defines, el script generará un hash para `defaultPassword`.

---

## 10. Configuración de NextAuth

NextAuth usa `AUTH_SECRET` para firmar la sesión. Debe ser un valor largo, aleatorio y distinto en cada entorno.

Buenas prácticas:

- No reutilices el mismo secreto entre desarrollo y producción.
- Regenera el secreto si sospechas que ha sido expuesto.
- Asegúrate de que la URL pública del entorno coincida con `NEXT_PUBLIC_APP_URL`.

Generación recomendada de `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

En Windows, si no tienes `openssl`, puedes usar:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 11. Configuración de Resend

Para el envío de correos, configura Resend con el dominio real que vayas a usar.

Pasos recomendados:

1. Crea una cuenta en Resend.
2. Verifica el dominio desde su panel.
3. Añade los registros DNS que te indique Resend.
4. Copia la API key en `RESEND_API_KEY`.
5. Ajusta `EMAIL_FROM` para que coincida con el dominio verificado.

Ejemplo de variables:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxx
EMAIL_FROM=Server Manager <no-reply@tu-dominio.com>
```

---

## 12. Ejecutar la aplicación en local

Arranca el entorno de desarrollo:

```bash
pnpm dev
```

La aplicación quedará disponible en:

```text
http://localhost:3000
```

---

## 13. Despliegue con Docker (método recomendado)

Docker Compose es la opción más sencilla para levantar el entorno completo (aplicación + base de datos) sin configurar PostgreSQL de forma manual.

**Requisito previo:** Docker Desktop instalado y en ejecución.

Antes de arrancar, asegúrate de que `DATABASE_URL` en tu `.env` usa el host `db`:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/app
POSTGRES_DB=app
```

Levanta los contenedores:

```bash
pnpm docker:up
```

El entrypoint del contenedor ejecuta automáticamente `pnpm reset-db` (migraciones + seed) y luego inicia el servidor de desarrollo. Una vez completado, la aplicación estará disponible en `http://localhost:3000`.

Para detener los contenedores:

```bash
docker compose -f docker/docker-compose.yml down
```

---

## 14. Verificación básica

Después de arrancar la aplicación, comprueba lo siguiente:

1. La página de login carga sin errores.
2. Puedes iniciar sesión con una cuenta del seed.
3. El panel principal muestra datos de ejemplo.
4. Las rutas protegidas redirigen correctamente si no hay sesión.
5. La documentación de la API es accesible en `http://localhost:3000/swagger`.

Si algo falla, revisa primero `DATABASE_URL`, `AUTH_SECRET` y `RESEND_API_KEY`.

---

## 15. Despliegue en producción

La vía más directa es Vercel.

### Variables a configurar en Vercel

- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SEED_USER_PASSWORD` solo si vas a volver a sembrar datos en ese entorno

### Flujo recomendado

1. Conecta el repositorio a Vercel.
2. Configura las variables de entorno en el proyecto.
3. Asegúrate de que la base de datos de producción está creada y accesible.
4. Ejecuta las migraciones contra la base real:
   ```bash
   pnpm prisma migrate deploy
   ```
5. Despliega la aplicación.

No ejecutes el seed en producción salvo que quieras crear explícitamente datos de prueba.

---

## 16. Scripts útiles

Estos son los scripts más relevantes del repositorio:

| Script | Uso |
| --- | --- |
| `pnpm dev` | Arranca el entorno local |
| `pnpm build` | Genera la build de producción |
| `pnpm start` | Ejecuta la build compilada |
| `pnpm docker:up` | Levanta el entorno completo con Docker Compose |
| `pnpm lint` | Revisa linting |
| `pnpm test` | Ejecuta la suite de tests |
| `pnpm test:ci` | Ejecuta tests con cobertura |
| `pnpm reset-db` | Resetea y repobla la base de datos de desarrollo |

---

## 17. Problemas frecuentes

- Si `pnpm exec tsx prisma/seed.ts` falla, confirma que `tsx` está instalado en el proyecto.
- Si Prisma no conecta, revisa que `DATABASE_URL` apunte a una base existente y accesible.
- Si el login falla, verifica `AUTH_SECRET` y que el seed se haya ejecutado correctamente.
- Si el correo no sale, revisa `RESEND_API_KEY` y el dominio verificado en Resend.

---

## 18. Resumen rápido

**Opción A — Local sin Docker:**

```bash
git clone https://github.com/Ignaciocefis/server-manager.git
cd server-manager
pnpm install          # también ejecuta prisma generate vía postinstall
pnpm add -D tsx
cp .env.example .env  # edita DATABASE_URL con @localhost y el nombre de tu BD
pnpm prisma migrate dev --name init
pnpm exec tsx prisma/seed.ts
pnpm dev
```

**Opción B — Docker (recomendado):**

```bash
git clone https://github.com/Ignaciocefis/server-manager.git
cd server-manager
pnpm install
cp .env.example .env  # DATABASE_URL ya apunta a @db:5432/app, no necesita cambios
pnpm docker:up        # migraciones + seed + servidor se ejecutan solos
```
