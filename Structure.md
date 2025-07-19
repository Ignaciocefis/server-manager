# Estructura del Proyecto

Este documento describe la estructura actual de carpetas, patrones y buenas prácticas para el desarrollo del proyecto en Next.js. Su objetivo es servir como referencia, facilitando la comprensión global de la arquitectura, la organización de los módulos y la interacción entre componentes, features y recursos compartidos.

Aquí encontrarás explicaciones detalladas sobre la finalidad de cada carpeta principal, ejemplos de flujo de datos típico, recomendaciones para la gestión de caché y revalidación, y lineamientos para mantener un código uniforme y escalable a medida que el proyecto crece.

> **Importante:**  
> Este documento está vivo y debe actualizarse a medida que evolucione la arquitectura del proyecto.

---

## Tabla de contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [Visión General](#visión-general)
  - [Detalles de la estructura](#detalles-de-la-estructura)
    - [/app](#app)
    - [/components](#components)
    - [/features](#features)
    - [/lib](#lib)
    - [/shared](#shared)
    - [/public](#public)
  - [Flujo de datos típico](#flujo-de-datos-típico)
  - [Caché y revalidación](#caché-y-revalidación)
    - [¿Dónde poner la caché?](#dónde-poner-la-caché)
    - [Ejemplo básico para list y create con caché](#ejemplo-básico-para-list-y-create-con-caché)
  - [Buenas prácticas en funciones de acceso a datos](#buenas-prácticas-en-funciones-de-acceso-a-datos)
  - [Buenas prácticas para API Routes](#buenas-prácticas-para-api-routes)
    - [Ejemplo de una API Route](#ejemplo-de-una-api-route)
  - [Buenas prácticas en hooks](#buenas-prácticas-en-hooks)
    - [Ejemplo de un hook para listar servidores](#ejemplo-de-un-hook-para-listar-servidores)
  - [Buenas prácticas](#buenas-prácticas)

---

## Visión General

* **/app**: Rutas, layouts, entrypoints y API routes.
* **/features/[feature]**: Componentes, hooks, lógica de dominio y acceso a datos relacionados a cada feature.
* **/components**: Componentes globales y de UI compartida (Navbar, Sidebar, etc).
* **/lib**: Schemas o lógica realmente global.
* **/shared**: Hooks, helpers o tipos globales no UI.
* **/public**: Archivos estáticos.

---

## Detalles de la estructura

### /app

Contiene las rutas principales de la aplicación y las API routes.

```
/app
  /(auth)
    layout.tsx
    page.tsx
    ...
  /(home)
    layout.tsx
    page.tsx
    /servers
      layout.tsx
      page.tsx
      loading.tsx
    /users-managment
      ...
  /api
    /servers
      list/route.ts            # API Route para listado de servidores
      create/route.ts          # API Route para crear servidores
    /auth
      me/route.ts
```

---

### /components

Componentes globales, layouts y elementos UI compartidos.

```
/components
  /Shared                      # Componentes globales (Navbar, Sidebar, etc)
    AppSidebar/
      AppSidebar.tsx
      AppSidebar.data.ts
      AppSidebar.types.ts
      AppSidebar.schema.ts
    Navbar/
      ...
    /Server
      /ServerCard
        ServerCard.tsx
        ServerCard.types.ts
  /ui                          # Componentes de bibliotecas externas o UI muy genéricos
    ...
```

---

### /features

Lógica de dominio, componentes, hooks, tipos, schemas y acceso a datos.

```
/features
  /servers
    /components
      /ServerList
        ServerList.tsx
        ServerList.types.ts
        ServerList.handlers.ts
        useServerList.ts
      /ServerTable
        ServerTable.tsx
        ServerTable.types.ts
        ServerTable.handlers.ts
        /hooks
          useServerTable.ts
          useServerTableFilters.ts
    data.ts                   # Acceso a la base de datos o servicios externos
    helper.ts
    types.ts
    schemas.ts
    utils.ts
  /users-managment
    /components
      ...
    data.ts
    helper.ts
    types.ts
    schemas.ts
    utils.ts
  /auth
    ... 
```

---

### /lib

```
/lib
  /schemas                     # Schemas globales (si se usan en más de un dominio)
```

Validaciones compartidas entre features.

---

### /shared

```
/shared
  ...                          # Hooks, helpers, utils o tipos realmente globales (no UI)
```

Lógica o utilidades que no pertenecen a un dominio concreto.

---

### /public

```
/public
  ...                          # Archivos estáticos (imágenes, fuentes, favicon, etc.)
```

---

## Flujo de datos típico

1. Un hook o función en un componente hace fetch a la API Route correspondiente (por ejemplo, `/api/servers/list`) usando fetch/axios.
2. La API Route (en `/app/api/servers/list/route.ts`) llama a la función de acceso a datos (por ejemplo, `/features/servers/data.ts`).
3. La función de datos obtiene la información de la base de datos o fuente externa, aplicando caché si está configurada.
4. El componente importa y utiliza el hook y los tipos correspondientes de su carpeta local.

---

## Caché y revalidación

Para mejorar rendimiento y escalabilidad, se recomienda utilizar la caché en funciones que leen datos (como listados) dentro de `/features/[feature]/data.ts`. Las funciones de escritura (create, update, delete) deben **revalidar la caché** para mantener los datos sincronizados.

### ¿Dónde poner la caché?

* En la función de acceso a datos que hace el `GET` con `"use cache"` y `cacheTag`.
* En las API routes de escritura (POST, PUT, DELETE) se debe llamar a `revalidateTag` con la misma etiqueta para invalidar la caché.

### Ejemplo básico para list y create con caché

```ts
// features/gpu/data.ts
export const listReservations = async (userId: string) => {
  "use cache";
  cacheLife("max");
  cacheTag(`user:${userId}:gpu-reservations`);

  return await db.select().from(gpuReservations).where(eq(gpuReservations.userId, userId));
};

export const createReservation = async (data: { userId: string; details: string }) => {
  return await db.insert(gpuReservations).values(data);
};
```

```ts
// app/api/gpu/list/route.ts
export async function GET(req: Request) {
  const userId = "123"; // Obtener usuario real
  const reservations = await listReservations(userId);
  return NextResponse.json(reservations);
}
```

```ts
// app/api/gpu/create/route.ts
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const { userId, details } = await req.json();
  await createReservation({ userId, details });

  revalidateTag(`user:${userId}:gpu-reservations`);

  return NextResponse.json({ success: true });
}
```

---

## Buenas prácticas en funciones de acceso a datos

1. **Extraer lógica repetida en helpers para evitar duplicación.**  
2. **Validar datos antes de operar para evitar errores** con schemas con Zod.
3. **Usar `use cache` y `cacheTag` en funciones de lectura** para aprovechar la caché de Next.js.
4. **Usar try-catch para capturar errores**.
5. **Devolver siempre un objeto uniforme:**  
   ```ts
    return { success: true, data: result, error: null };
   ```

---

## Buenas prácticas para API Routes

1. **Valida la entrada** con schemas con Zod.  
2. **Maneja errores y responde con códigos HTTP adecuados** (400, 401, 500).  
3. **Separa la lógica de negocio en funciones externas** (ej. `/features/.../data.ts`).  
4. **Comprueba autenticación/autorización antes de operar**.  
5. **Usa try-catch para capturar errores y loguearlos**.  
6. **Usa NextResponse para devolver respuestas claras, uniformes y con el status adecuado**.
  ```ts
  return NextResponse.json({ data, success: true, error: null }, { status: 200 });
  ```

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

* No se crean componentes en `/app`. Todos los componentes deben estar en su feature o en `/components` si son globales.
* No se crea lógica de API fuera de `/app/api/`. Las API routes siempre viven en esa carpeta.
* Se extrae la lógica de acceso a datos a `/features/[feature]/data.ts`.
* Se organizan los componentes en subcarpetas dentro de `/features/[feature]/components`.
* Se usa `/components/Shared` para layouts, barras de navegación, sidebars, etc.
* Se usa `/components/ui` para wrappers de librerías externas o UI ultra-genéricos.
* Si hay lógica/validaciones/helpers globales, deben ir en `/lib` o `/shared` según convenga.

---

> **Importante:**  
> Este documento está vivo y debe actualizarse a medida que evolucione la arquitectura del proyecto.