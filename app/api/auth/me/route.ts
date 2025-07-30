import { getUserById } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { data: null, success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const result = await getUserById(userId);

    if (!result?.success || result.data == null) {
      return NextResponse.json(
        { data: { exists: false }, success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          ...result.data,
        },
        success: true,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Error interno del servidor" },
      { status: 500 }
    );

  }
}
