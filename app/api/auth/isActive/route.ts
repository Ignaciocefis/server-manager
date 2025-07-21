import { NextResponse } from "next/server";
import { userIsActive } from "@/features/user/data";

export async function GET(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { data: null, success: false, error: "Email inválido" },
        { status: 400 }
      );
    }

    const result = await userIsActive(email);

    if (!result?.success || result.data == null) {
      return NextResponse.json(
        { data: { exists: false }, success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          exists: true,
          isActive: result.data ?? false,
        },
        success: true,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en isActive:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}