import { createEventLog } from "@/features/eventLog/data";
import { getUserNameById, updateUserCategory } from "@/features/user/data";
import { updateUserCategorySchema } from "@/features/user/schemas";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const body = await request.json();
    const data = updateUserCategorySchema(t).parse(body);
    const { userId, category } = data;

    const { isCategory } = await hasCategory("ADMIN");
    if (!isCategory) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.unauthorized") },
        { status: 403 }
      );
    }

    const userUpdate = await updateUserCategory(userId, category);

    if (!userUpdate || userUpdate.error || !userUpdate.success) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.categoryUpdateFailed") },
        { status: 500 }
      );
    }

    const userName = await getUserNameById(userId);

    if (userName.error || !userName.success || !userName.data) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.userNotFound") },
        { status: 404 }
      );
    }

    const userFullName = getFullName(
      userName.data.firstSurname ?? undefined,
      userName.data.secondSurname ?? undefined,
      userName.data.name ?? undefined
    );

    const log = await createEventLog({
      eventType: "USER_UPDATED",
      userId,
      message: `EventLog.logMessage.user_updated_category|${userFullName}|${category}`,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.createEventLogError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: "Investigador asignado correctamente", success: true, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/user/assignResearcher:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
