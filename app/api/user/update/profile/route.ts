import { createEventLog } from "@/features/eventLog/data";
import { updateUser } from "@/features/user/data";
import { updateUserSchema } from "@/features/user/schemas";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const { userId } = await hasCategory();
    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.unauthorized") },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateUserSchema(t).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.invalidValues") },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const result = await updateUser(userId, {
      ...data,
      secondSurname: typeof data.secondSurname === "undefined" ? null : data.secondSurname,
    });

    if (!result || !result.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.updateProfileError") },
        { status: 500 }
      );
    }

    const userFullName = getFullName(
      data.firstSurname ?? undefined,
      data.secondSurname ?? undefined,
      data.name ?? undefined
    );

    const log = await createEventLog({
      eventType: "USER_UPDATED",
      userId,
      message: `EventLog.logMessage.user_updated|${userFullName}`,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.createEventLogError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/user/update/profile:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
