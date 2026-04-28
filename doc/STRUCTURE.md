# Estructura del Proyecto - Server Manager

## Tabla de Contenidos

- [Estructura del Proyecto - Server Manager](#estructura-del-proyecto---server-manager)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Visión General](#visión-general)
  - [Detalles de la estructura](#detalles-de-la-estructura)
    - [/app](#app)
    - [/features](#features)
    - [/components](#components)
    - [/lib](#lib)
    - [/hooks](#hooks)
    - [/auth](#auth)
    - [/prisma](#prisma)
    - [/locales](#locales)
    - [/public](#public)
    - [/__tests__](#tests)
  - [Flujo de datos típico](#flujo-de-datos-típico)
  - [Buenas prácticas en funciones de acceso a datos](#buenas-prácticas-en-funciones-de-acceso-a-datos)
  - [Swagger UI para documentación de API](#swagger-ui-para-documentación-de-api)
  - [Buenas prácticas para API Routes](#buenas-prácticas-para-api-routes)
    - [Ejemplo de una API Route](#ejemplo-de-una-api-route)
  - [Buenas prácticas en hooks](#buenas-prácticas-en-hooks)
    - [Ejemplo de un hook para listar servidores](#ejemplo-de-un-hook-para-listar-servidores)
  - [Buenas prácticas](#buenas-prácticas)
---

## Visión General

- **/app**: Rutas, layouts, entrypoints y API routes de Next.js 15 (App Router).
- **/features/[feature]**: Componentes, lógica de dominio, acceso a datos, schemas y tipos específicos de cada feature.
- **/components**: Componentes globales y de UI compartida.
- **/lib**: Utilidades globales, configuraciones, servicios externos y tipos compartidos.
- **/hooks**: Custom hooks de React globales.
- **/auth**: Configuración de NextAuth 5.
- **/prisma**: Schema de base de datos, migraciones y seed.
- **/locales**: Archivos de internacionalización.
- **/public**: Archivos estáticos.
- **/__tests__: Tests organizados por dominio.

---

## Detalles de la estructura

### /app

Contiene las rutas principales de la aplicación y las API routes siguiendo el patrón de Next.js 15 App Router.

```
/app
  /(auth)/                       # Grupo de rutas de autenticación
    layout.tsx
    login/
      page.tsx
  /(home)/                       # Grupo de rutas principales
    layout.tsx
    page.tsx                     # Dashboard principal
    calendar/                    # Calendario de reservas
      page.tsx
    ...
  /api/                         # API Routes organizadas por dominio
    /auth/                       # Endpoints de autenticación
      [...nextauth]/route.ts
      changePassword/route.ts
      isActive/route.ts
      me/route.ts
    /eventLogs/                  # Endpoints de logs de eventos
      list/route.ts
      notificationList/route.ts
      notificationRead/route.ts
    ...
  error.tsx                     # Página de error global
  globals.css                   # Estilos globales
  layout.tsx                    # Layout raíz
  middleware.ts                 # Middleware de Next.js
  not-found.tsx                # Página 404
  providers.tsx                 # Proveedores globales
  unauthorized/                # Página de no autorizado
    page.tsx
```

---

### /features

Cada feature contiene su lógica de dominio, componentes, acceso a datos, schemas y tipos. Las features actuales son:

```
/features
  /auth/                        # Autenticación
    components/
      LoginForm/                # Formulario de login
      RecoverPasswordForm/      # Formulario de recuperación de contraseña
      index.ts                  # Export centralizado
    schemas.ts                  # Schemas de validación
  /eventLog/                    # Logs de eventos
    components/
      LogsContainer/            # Contenedor de logs
      LogsTable/                # Tabla de logs
      TypeBadge/                # Badge de tipo de evento
      index.ts                  # Export centralizado
    data.ts                     # Acceso a datos de eventos
    helpers.ts                  # Helpers específicos
    schemas.ts                  # Schemas de validación
    types.ts                    # Tipos específicos
    utils.tsx                   # Utilidades específicas
  ...
```

---

### /components

Componentes globales compartidos entre diferentes features.

```
/components
  /Shared/                      # Componentes de aplicación
    AppSidebar/                 # Barra lateral de navegación
      AppSidebar.tsx
      AppSidebar.data.ts
    ConfirmDialog/              # Diálogo de confirmación
      ConfirmDialog.tsx
      ConfirmDialog.types.ts
      ConfirmDialog.utils.tsx
    ...
    index.ts                      # Export centralizado
  /ui/                          # Componentes base (shadcn/ui)
    badge.tsx
    button.tsx
    calendar.tsx
    ...
```

---

### /lib

Utilidades globales, configuraciones y servicios externos.

```
/lib
  /auth/                        # Utilidades de autenticación
    charsets.ts                 # Conjuntos de caracteres
    generatePassword.ts         # Generación de contraseñas
    hasCategory.ts              # Verificación de categorías
  /services/                    # Servicios externos
    /errors/                    # Manejo de errores
      errors.ts                 # Utilidades de error
    /language/                  # Servicio de idiomas
      getServerLanguage.ts      # Obtener idioma del servidor
    /resend/                    # Servicio de email (Resend)
      CreateUser/               # Email de creación de usuario
      recoverPassword/          # Email de recuperación
      resend.ts                 # Cliente de Resend
      resend.types.ts           # Tipos de Resend
      reservationActive/        # Email de reserva activa
      reservationCompleted/      # Email de reserva completada
      serverAvailabilityChange/  # Email de cambio de disponibilidad
    /reservations/              # Servicio de reservas
      updateStatus.ts           # Actualizar estado de reservas
  /types/                       # Tipos compartidos
    BDResponse.types.ts         # Tipos de respuesta de base de datos
    user.ts                     # Tipos de usuario
  db.ts                         # Configuración de Prisma
  utils.ts                      # Utilidades generales
```

---

### /hooks

Custom hooks de React globales.

```
/hooks
  use-mobile.ts                 # Hook para detectar dispositivos móviles
  useHasCategory.ts             # Hook para verificar categorías de usuario
  useLanguage.tsx              # Hook para gestión de idiomas
```

---

### /auth

Configuración de NextAuth 5 para autenticación.

```
/auth
  auth.config.ts                # Configuración de NextAuth
  auth.ts                       # Instancia de NextAuth
  /types/
    next-auth.d.ts             # Definiciones de tipos para NextAuth
```

---

### /prisma

Schema de base de datos, migraciones y datos de prueba.

```
/prisma
  /migrations/                  # Migraciones de base de datos
  schema.prisma                # Schema de Prisma
  seed.ts                      # Datos de prueba iniciales
  resetDB.ts                   # Script para resetear la base de datos
```

---

### /locales

Archivos de internacionalización.

```
/locales
  en.json                      # Traducciones en inglés
  es.json                      # Traducciones en español
```

---

### /public

Archivos estáticos.

```
/public
  error.gif                    # Imagen de error
  favicon-minerva.ico          # Favicon
  logo-minerva-short.png       # Logo corto
  logo-minerva.webp            # Logo en formato webp
  /languages/                  # Iconos de idiomas
```

---

### /__tests__

Tests organizados por dominio.

```
/__tests__
  /api/                        # Tests de API routes
  /app/                        # Tests de páginas
  /features/                   # Tests de features
```

---

## Flujo de datos típico

1. Un componente hace fetch a la API Route correspondiente (por ejemplo, `/api/gpu/list`) usando axios.
2. La API Route (en `/app/api/gpu/list/route.ts`) llama a la función de acceso a datos (por ejemplo, `/features/gpu/data.ts`).
3. La función de datos obtiene la información de la base de datos usando Prisma, aplicando caché si está configurada.
4. El componente utiliza los tipos y helpers importados de su feature correspondiente.

---

## Buenas prácticas en funciones de acceso a datos

1. **Extraer lógica repetida en helpers para evitar duplicación.**  
2. **Validar datos antes de operar para evitar errores.**
3. **Usar try-catch para capturar errores**.
4. **Devolver siempre un objeto uniforme:**  
   ```ts
    return { success: true, data: result, error: null };
   ```

---

## Swagger UI para documentación de API

El Swagger UI se encuentra en la ruta `/swagger` y proporciona una interfaz gráfica para explorar y interactuar con la API. Está protegido para que solo sea accesible en desarrollo. La especificación OpenAPI se genera dinámicamente a partir de las API Routes usando `lib/openapi.ts`.

Para acceder al Swagger UI, simplemente navega a `http://localhost:3000/swagger` durante el desarrollo. Allí podrás ver todos los endpoints disponibles, sus métodos, parámetros y respuestas esperadas, lo que facilita la documentación y pruebas de la API.

En cada endpoint de la API, asegúrate de incluir descripciones claras y ejemplos de request/response para que el Swagger UI sea lo más útil posible para los desarrolladores que interactúan con la API.

---

## Buenas prácticas para API Routes

1. **Valida la entrada.**  
2. **Maneja errores y responde con códigos HTTP adecuados** (400, 401, 500).  
3. **Separa la lógica de negocio en funciones externas** (ej. `/features/.../data.ts`).  
4. **Comprueba autenticación/autorización antes de operar**.  
5. **Usa try-catch para capturar errores y loguearlos**.  
6. **Usa NextResponse para devolver respuestas claras, uniformes y con el status adecuado**.
  ```ts
  return NextResponse.json({ data, success: true, error: null }, { status: 200 });
  ```
7. **Documenta el endpoint con comentarios claros sobre su funcionalidad, parámetros esperados y posibles respuestas**.

### Ejemplo de una API Route

```ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado", success: false, data: null }, { status: 401 });
    }

    const result = await doSomething(data, session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error de operación", success: false, data: null }, { status: 400 });
    }

    return NextResponse.json({ data: result.data, success: true, error: null }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno", success: false, data: null }, { status: 500 });
  }
}
```

---

## Buenas prácticas en hooks

1. **Empieza siempre por use, por ejemplo useServerList.**
2. **Una sola función clara por hook.**
3. **Define tipos para parámetros y retornos.**
4. **Evita duplicidad, extrae lógica común y reutilizable.**
5. **Expón estados como loading, error y los datos procesados.**

### Ejemplo de un hook para listar servidores

```ts
import { useEffect, useState } from "react";
import axios from "axios";
import type { ServerListItem } from "./ServerList.types";

export function useServerList(userId: string) {
  const [servers, setServers] = useState<ServerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    axios
      .get(`/api/servers/list?id=${userId}`)
      .then(res => {
        if (res.data.success) {
          setServers(res.data.data || []);
        } else {
          setError(res.data.error || "No se pudieron cargar los servidores");
        }
      })
      .catch(() => setError("No se pudieron cargar los servidores"))
      .finally(() => setLoading(false));
  }, [userId]);

  return { servers, loading, error };
}
```

---

## Buenas prácticas

- No se crean componentes en `/app`. Todos los componentes deben estar en su feature o en `/components` si son globales.
- No se crea lógica de API fuera de `/app/api/`. Las API routes siempre viven en esa carpeta.
- Se extrae la lógica de acceso a datos a `/features/[feature]/data.ts`.
- Se organizan los componentes en subcarpetas dentro de `/features/[feature]/components`.
- Se usa `/components/Shared` para layouts, barras de navegación, sidebars, etc.
- Se usa `/components/ui` para wrappers de librerías externas.
- Si hay lógica/validaciones/helpers globales, deben ir en `/lib`.
- Los hooks globales van en `/hooks`.
- La configuración de autenticación va en `/auth`.
- El schema de base de datos y migraciones van en `/prisma`.
- Los archivos de internacionalización van en `/locales`.

---

> **Importante:**  
> Este documento está vivo y debe actualizarse a medida que evolucione la arquitectura del proyecto.
