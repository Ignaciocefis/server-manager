import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hasCategory } from "@/lib/auth/hasCategory";
import { generateRandomPassword } from "@/lib/auth/generatePassword";
import { sendEmailCreateAccount } from "@/lib/auth/resend/resend";
import { formSchema } from "@/lib/schemas/auth/register.schema";

export async function POST(request: Request) {
  const body = await request.json();
  
  const data = formSchema.parse(body);

  const { email, name, firstSurname, secondSurname, category, assignedToId } = data;
  try {
    const isAdmin = await hasCategory("ADMIN");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para crear usuarios" },
        { status: 403 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const generatedPassword = generateRandomPassword();

    const emailSent = await sendEmailCreateAccount({
      to: email,
      password: generatedPassword,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Error al enviar el correo de bienvenida" },
        { status: 500 }
      );
    }

    const userCreated = await db.user.create({
      data: {
        email,
        password: await bcrypt.hash(generatedPassword, 10),
        name,
        firstSurname,
        secondSurname,
        category,
        assignedTo: category === "JUNIOR" && assignedToId
          ? { connect: { id: assignedToId } }
          : undefined,      },
      select: {
        id: true,
        email: true,
        name: true,
        firstSurname: true,
        secondSurname: true,
        category: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { message: "Usuario creado correctamente", user: userCreated },
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