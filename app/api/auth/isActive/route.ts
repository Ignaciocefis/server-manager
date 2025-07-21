import { NextResponse } from "next/server";
import { userIsActive } from "@/features/user/data";

export async function GET(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { data: null, success: false, error: "Email inválido" },
        { status: 400 }
      );
    }

    const user = await userIsActive(email);

    if (!user) {
      return NextResponse.json(
        { data: { exists: false }, success: true, error: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          exists: true,
          isActive: user.data ?? false,
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
