import { NextResponse } from "next/server";

import { hasCategory } from "@/lib/auth/hasCategory";
import { generateRandomPassword } from "@/lib/auth/generatePassword";
import { createUser, existsUserByEmail, getUserNameById } from "@/features/user/data";
import { createUserSchema } from "@/features/user/schemas";
import { createEventLog } from "@/features/eventLog/data";
import { getFullName } from "@/features/user/utils";
import { sendEmailCreateUser } from "@/lib/services/resend/CreateUser/createUser";

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
    console.log("User exists by email:", exists);
    if (exists.data) {
      return NextResponse.json(
        { success: false, data: null, error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const password = generateRandomPassword();

    const emailSent = await sendEmailCreateUser(data.email, password);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al enviar el correo de bienvenida" },
        { status: 500 }
      );
    }

    const userCreated = await createUser(data, password);

    if (!userCreated.success || userCreated.error || !userCreated.data) {
      return NextResponse.json(
        { success: false, data: null, error: userCreated.error || "No se pudo crear el usuario" },
        { status: 500 }
      );
    }

    const userName = await getUserNameById(userCreated.data);
    if (userName.error || !userName.success || !userName.data) {
      return NextResponse.json(
        { data: null, success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userFullName = getFullName(
      userName.data.firstSurname ?? undefined,
      userName.data.secondSurname ?? undefined,
      userName.data.name ?? undefined
    );

    const log = await createEventLog({
      eventType: "USER_CREATED",
      userId: userCreated.data,
      message: `Usuario ${userFullName} creado`,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al crear el registro de evento" },
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
