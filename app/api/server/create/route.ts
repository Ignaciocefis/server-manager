import { NextResponse } from "next/server";

import { hasCategory } from "@/lib/auth/hasCategory";
import { formSchema } from "@/lib/schemas/server/create.schema";
import { createServer, existsServerByName } from "@/data/server";

export async function POST(request: Request) {
  const body = await request.json();
  
  const data = formSchema.parse(body);

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

    const serverCreated = createServer(data)

    return NextResponse.json(
      { message: "Servidor creado correctamente", server: serverCreated },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
  }