import { createEventLog } from "@/features/eventLog/data";
import { getUserNameById, toggleUserActiveStatus } from "@/features/user/data";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const { isCategory } = await hasCategory("ADMIN");

    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.unauthorized") },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.userNotFound") },
        { status: 400 }
      );
    }

    const result = await toggleUserActiveStatus(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.toggleUserStatusError") },
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
      eventType: `${result.data ? "USER_REACTIVATED" : "USER_DEACTIVATED"}`,
      userId,
      message: `EventLog.logMessage.user_${result.data ? "reactivated" : "deactivated"}|${userFullName}`,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.createEventLogError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/user/toggleActive:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
