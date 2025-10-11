import { getUserByIdWithPassword, updatePassword } from "@/features/user/data";
import { updateUserPasswordSchema } from "@/features/user/schemas";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import bcrypt, { compare } from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { t } = await getServerLanguage();

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.unauthorized") },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = updateUserPasswordSchema(t).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.invalidValues") },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await getUserByIdWithPassword(userId);

    if (!user || !user.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.userNotFound") },
        { status: 404 }
      );
    }

    const passwordMatch = await compare(currentPassword, user.data.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.currentPasswordIncorrect") },
        { status: 401 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await updatePassword(userId, hashedNewPassword);

    if (!updatedUser || !updatedUser.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.updatePasswordError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/user/update/password:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
