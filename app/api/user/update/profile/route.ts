import { auth } from "@/auth/auth";
import { db } from "@/lib/db";
import { formSchema } from "@/lib/schemas/auth/updateProfile.schema";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const body = await request.json();

  const data = formSchema.parse(body);

  const { name, firstSurname, secondSurname } = data;

  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name,
        firstSurname,
        secondSurname: secondSurname || null,
      },
      select: {
        id: true,
        name: true,
        firstSurname: true,
        secondSurname: true,
        email: true,
        category: true,
      },
    });

    return NextResponse.json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
}
