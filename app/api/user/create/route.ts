import { NextResponse } from "next/server";

import { hasCategory } from "@/lib/auth/hasCategory";
import { generateRandomPassword } from "@/lib/auth/generatePassword";
import { sendEmailCreateAccount } from "@/lib/auth/resend/resend";
import { createUser, existsUserByEmail } from "@/features/user/data";
import { createUserSchema } from "@/features/user/schemas";

export async function POST(request: Request) {
  try {
    const { isCategory } = await hasCategory("ADMIN");
    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: "No tienes permisos para crear usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const exists = await existsUserByEmail(data.email);
    if (exists) {
      return NextResponse.json(
        { success: false, data: null, error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const password = generateRandomPassword();

    const emailSent = await sendEmailCreateAccount({
      to: data.email,
      password,
    });

    if (!emailSent) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al enviar el correo de bienvenida" },
        { status: 500 }
      );
    }

    const userCreated = await createUser(data, password);

    if (!userCreated.success) {
      return NextResponse.json(
        { success: false, data: null, error: userCreated.error || "No se pudo crear el usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/user/create:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
