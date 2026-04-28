[![CI](https://github.com/Ignaciocefis/server-manager/actions/workflows/ci-cd-pipeline.yml/badge.svg)](https://github.com/Ignaciocefis/server-manager/actions/workflows/ci-cd-pipeline.yml)
![Vercel Deploy](https://deploy-badge.vercel.app/vercel/server-manager-tau)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/36e0cc2524f4413695098292fc678aa6)](https://app.codacy.com/gh/Ignaciocefis/server-manager/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/36e0cc2524f4413695098292fc678aa6)](https://app.codacy.com/gh/Ignaciocefis/server-manager/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

# Server Manager

## Tabla de Contenidos

- [Server Manager](#server-manager)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Características Principales](#características-principales)
    - [Gestión de Usuarios](#gestión-de-usuarios)
    - [Gestión de Servidores](#gestión-de-servidores)
    - [Sistema de Reservas de GPUs](#sistema-de-reservas-de-gpus)
    - [Tracking de Eventos](#tracking-de-eventos)
    - [Experiencia de Usuario](#experiencia-de-usuario)
  - [Stack Tecnológico](#stack-tecnológico)
  - [Requisitos Previos](#requisitos-previos)
    - [Instalación de Requisitos](#instalación-de-requisitos)
      - [Node.js](#nodejs)
      - [PostgreSQL](#postgresql)
      - [pnpm](#pnpm)
  - [Instalación y Configuración](#instalación-y-configuración)
    - [1. Obtener el Código](#1-obtener-el-código)
    - [2. Instalar Dependencias](#2-instalar-dependencias)
    - [3. Configurar Variables de Entorno](#3-configurar-variables-de-entorno)
    - [4. Configurar la Base de Datos](#4-configurar-la-base-de-datos)
  - [Variables de Entorno](#variables-de-entorno)
  - [Credenciales de Prueba](#credenciales-de-prueba)
  - [Scripts Disponibles](#scripts-disponibles)
    - [Desarrollo](#desarrollo)
    - [Gestión de Base de Datos](#gestión-de-base-de-datos)
    - [Testing](#testing)
    - [Calidad de Código](#calidad-de-código)
  - [Despliegue con Docker](#despliegue-con-docker)
    - [Docker Compose (Método Recomendado)](#docker-compose-método-recomendado)
    - [Docker Individual](#docker-individual)
  - [Swagger API Documentation](#swagger-api-documentation)
  - [Documentación Adicional](#documentación-adicional)

---

Server Manager es una aplicación web moderna diseñada para la gestión integral de servidores y GPUs en entornos de investigación y desarrollo. El sistema proporciona una plataforma centralizada para administrar recursos computacionales, gestionar usuarios con diferentes niveles de acceso, y controlar el uso de GPUs mediante un sistema de reservas eficiente.

## Características Principales

La aplicación ofrece un conjunto completo de funcionalidades orientadas a optimizar la gestión de recursos computacionales:

### Gestión de Usuarios
Implementa un sistema jerárquico de roles que incluye administradores, investigadores y junior researchers. Cada rol cuenta con permisos específicos y los junior researchers pueden ser asignados a mentores para supervisión directa, facilitando la colaboración en proyectos de investigación.

### Gestión de Servidores
Permite la creación, edición y monitoreo de servidores con control de disponibilidad en tiempo real. Los administradores pueden gestionar la infraestructura física y virtual, asegurando que los recursos estén disponibles cuando los usuarios los necesiten.

### Sistema de Reservas de GPUs
El núcleo del sistema es su capacidad para gestionar reservas de GPUs mediante un calendario interactivo. Los usuarios pueden solicitar reservas, extender periodos de uso cuando sea necesario, y cancelar reservas cuando los recursos ya no se requieran. El sistema incluye heatmaps de uso para visualizar patrones de utilización.

### Tracking de Eventos
Todos los cambios y acciones dentro del sistema son registrados en un log de eventos completo, proporcionando auditoría y trazabilidad de todas las operaciones realizadas por los usuarios.

### Experiencia de Usuario
La interfaz está diseñada con un enfoque responsive que funciona perfectamente tanto en dispositivos móviles como en escritorio. El soporte multi-idioma (español e inglés) facilita su uso en equipos internacionales.

---

## Stack Tecnológico

La aplicación está construida sobre tecnologías modernas que garantizan rendimiento, seguridad y escalabilidad:

- **Frontend**: Utiliza Next.js 15 con React 19 y TypeScript, proporcionando una base sólida para aplicaciones web modernas con type safety y optimización automática.
- **Interfaz de Usuario**: Implementa Tailwind CSS para estilos responsivos, Radix UI para componentes accesibles, y Lucide para iconos consistentes.
- **Backend**: Las API Routes de Next.js manejan toda la lógica del servidor, manteniendo una arquitectura unificada.
- **Base de Datos**: PostgreSQL gestionado mediante Prisma ORM, ofreciendo consultas type-safe y migraciones controladas.
- **Autenticación**: NextAuth 5 con estrategia JWT asegura el acceso seguro a la aplicación.
- **Validación**: Zod proporciona validación de schemas robusta y type-safe.
- **Comunicación HTTP**: Axios maneja las peticiones API de manera eficiente.
- **Email**: Resend facilita el envío de notificaciones por correo electrónico.
- **Testing**: Jest asegura la calidad del código mediante pruebas automatizadas.
- **Despliegue**: Docker y Docker Compose facilitan el despliegue en contenedores, con soporte para Vercel.

---

## Requisitos Previos

Antes de comenzar con la instalación, asegúrate de contar con los siguientes requisitos en tu entorno de desarrollo:

- Node.js versión 20 o superior
- PostgreSQL versión 16 o superior
- pnpm

### Instalación de Requisitos

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

**Linux (Fedora/RHEL):**
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install nodejs
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
- Recuerda la contraseña que configures para el usuario postgres

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

**Linux (Fedora/RHEL):**
```bash
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
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

---

## Instalación y Configuración

El proceso de instalación sigue una serie de pasos secuenciales para asegurar una configuración correcta del entorno:

### 1. Obtener el Código
Comienza clonando el repositorio del proyecto y navegando al directorio creado:

```bash
git clone https://github.com/Ignaciocefis/server-manager.git
cd server-manager
```

### 2. Instalar Dependencias
Instala todas las dependencias necesarias del proyecto utilizando tu gestor de paquetes preferido:

```bash
pnpm install
```

**Nota adicional**: Para el correcto funcionamiento del seed de la base de datos, el proyecto requiere tsx como dependencia de desarrollo.

```bash
pnpm add -D tsx
```

### 3. Configurar Variables de Entorno
Copia el archivo de ejemplo de variables de entorno y personalízalo con tus credenciales:

```bash
cp .env.example .env
```

El archivo `.env` debe contener las siguientes configuraciones esenciales:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth
AUTH_SECRET=your_auth_secret

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app

# Email Service
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Tu Nombre <hola@tudominio.com>

# Seed Data
SEED_USER_PASSWORD=admin123
```

### 4. Configurar la Base de Datos
Ejecuta las migraciones para crear la estructura de la base de datos, genera el cliente Prisma y pobla las tablas con datos iniciales:

```bash
pnpm prisma migrate deploy || pnpm prisma migrate dev --name init
pnpm prisma generate
pnpm exec tsx prisma/seed.ts
```

**Nota**: El comando `pnpm prisma migrate deploy || pnpm prisma migrate dev --name init` intenta aplicar las migraciones primero. Si falla, crea una migración inicial. El comando `pnpm prisma generate` es necesario para generar el cliente Prisma después de aplicar las migraciones. 

---

## Variables de Entorno

La aplicación requiere configuración mediante variables de entorno para su funcionamiento correcto:

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Modo de Desarrollo | `development` |
| `NEXT_PUBLIC_APP_URL` | URL base de la aplicación | `http://localhost:3000` |
| `AUTH_SECRET` | Secreto para autenticación JWT | `your_auth_secret` |
| `DATABASE_URL` | URL de conexión a la base de datos PostgreSQL | `postgresql://postgres:postgres@db:5432/app` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `POSTGRES_DB` | Nombre de la base de datos PostgreSQL | `app` |
| `RESEND_API_KEY` | Clave de API de Resend | `your_resend_api_key` |
| `EMAIL_FROM` | Remitente usado por Resend para el campo `from` | `Tu Nombre <hola@tudominio.com>` |
| `EMAIL_USER` | Correo de la cuenta de Resend | `your_email@outlook.com` |
| `SEED_USER_PASSWORD` | Contraseña de usuario para pruebas | `admin123` |

---

## Credenciales de Prueba

Después de ejecutar el proceso de seed de la base de datos, estarán disponibles las siguientes credenciales para pruebas (la contraseña se indica en las variables de entorno):

- **Administrador**: `admin@example.com` (contraseña: `admin123`)
- **Investigador**: `researcher@example.com` (contraseña: `admin123`)
- **Junior Researcher**: `junior@example.com` (contraseña: `admin123`)

Estas cuentas permiten explorar las diferentes funcionalidades según el nivel de acceso correspondiente.

---

## Scripts Disponibles

El proyecto incluye una serie de scripts npm para facilitar las tareas comunes de desarrollo y despliegue:

### Desarrollo
- `pnpm dev` - Inicia el servidor de desarrollo con hot-reload
- `pnpm build` - Compila la aplicación para producción
- `pnpm start` - Inicia el servidor de producción

### Gestión de Base de Datos
- `pnpm prisma migrate dev` - Crea una nueva migración basada en cambios del schema
- `pnpm prisma migrate deploy` - Aplica las migraciones pendientes a la base de datos
- `pnpm exec tsx prisma/seed.ts` - Puebla la base de datos con datos de prueba
- `pnpm prisma studio` - Abre la interfaz visual de Prisma Studio
- `pnpm reset-db` - Resetea y puebla completamente la base de datos

### Testing
- `pnpm test` - Ejecuta la suite de tests completa
- `pnpm test:watch` - Ejecuta tests en modo watch para desarrollo continuo
- `pnpm test:ci` - Ejecuta tests configurados para integración continua

### Calidad de Código
- `pnpm lint` - Ejecuta ESLint para verificar la calidad del código

---

## Despliegue con Docker

La aplicación puede ser desplegada utilizando contenedores Docker, lo que facilita la consistencia entre entornos de desarrollo y producción.

### Docker Compose (Método Recomendado)

Docker Compose es la opción preferida para despliegues locales y de desarrollo. El Dockerfile incluido configura automáticamente la base de datos y arranca la aplicación en modo desarrollo:

1. **Iniciar los Contenedores**
Construye y levanta todos los servicios necesarios:

```bash
docker-compose up -d
```

El Dockerfile ejecuta automáticamente:
- Aplicación de migraciones Prisma
- Generación del cliente Prisma
- Seed de datos iniciales
- Inicio del servidor de desarrollo Next.js

**Nota**: El contenedor monta el directorio del proyecto como volumen, lo que permite hot-reload durante el desarrollo.

2. **Acceder a la Aplicación**
Una vez completados los pasos anteriores, la aplicación estará disponible en:

```
http://localhost:3000
```

### Docker Individual

Para despliegues más personalizados, puedes construir y ejecutar la imagen individualmente:

1. **Construir la Imagen**
```bash
docker build -t server-manager .
```

2. **Ejecutar el Contenedor**
```bash
docker run -p 3000:3000 --env-file .env server-manager
```

**Nota**: El Dockerfile actual está configurado para desarrollo. Para producción, considera modificar el `docker-entrypoint.sh` para usar `pnpm build` y `pnpm start` en lugar de `pnpm dev`.

---

## Swagger API Documentation

La documentación de la API de la aplicación se encuentra disponible en:
```
http://localhost:3000/swagger
```

El swagger se genera dinámicamente a partir de los archivos de rutas API, proporcionando una referencia completa y actualizada de todos los endpoints disponibles, sus métodos HTTP, parámetros de entrada y respuestas esperadas.

El swagger permite iniciar sesión directamente desde la interfaz para probar los endpoints que requieren autenticación, facilitando la exploración de la API.

Es necesario ejecutar la aplicación en modo desarrollo para acceder a esta documentación, ya que en producción esta ruta no estará disponible por razones de seguridad.

---

## Documentación Adicional

Para obtener información más detallada sobre el uso de la aplicación, su API y estructura del proyecto, consulta los siguientes documentos:

- **[Estructura del Proyecto](doc/STRUCTURE.md)** - Documentación técnica detallada sobre la arquitectura del proyecto, estructura de carpetas, patrones de diseño, flujo de datos, caché y revalidación, buenas prácticas y ejemplos de código.

- **[Manual de Usuario](doc/USER_MANUAL.md)** - Guía completa para usuarios finales que explica cómo utilizar todas las funcionalidades de la aplicación, incluyendo gestión de servidores, reservas de GPUs, calendario de reservas, gestión de usuarios y más.

- **[Manual de Instalación y Despliegue](doc/MANUAL_INSTALACION.md)** - Guía paso a paso para instalar, configurar y desplegar el proyecto en entornos locales y de producción.

---
