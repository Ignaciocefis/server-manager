import { NextResponse } from "next/server";

import { hasCategory } from "@/lib/auth/hasCategory";
import { createServer, existsServerByName } from "@/data/server";
import { createServerFormSchema } from "@/lib/schemas/server/create.schema";

export async function POST(request: Request) {
  const body = await request.json();
  
  const data = createServerFormSchema.parse(body);

  const { name } = data;
  try {
    const isAdmin = await hasCategory("ADMIN");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para crear servidores" },
        { status: 403 }
      );
    }

    const serverExists = await existsServerByName(name);

    if (serverExists) {
      return NextResponse.json(
        { error: "Ya existe un servidor con ese nombre" },
        { status: 409 }
      );
    }

    const serverCreated = await createServer(data);

    if (serverCreated) {
      return NextResponse.json(
        { message: "Servidor creado correctamente", server: serverCreated },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "No se pudo crear el servidor" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
  }