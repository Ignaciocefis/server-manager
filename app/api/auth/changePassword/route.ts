import { NextResponse } from "next/server";
import { getUserNameById, userRecoverPassword } from "@/features/user/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { generateRandomPassword } from "@/lib/auth/generatePassword";
import { getFullName } from "@/features/user/utils";
import { createEventLog } from "@/features/eventLog/data";
import { sendEmailRecoverPassword } from "@/lib/services/resend/recoverPassword/recoverPassword";

export async function POST(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, data: null, error: t("Auth.Route.invalidValues") },
        { status: 400 }
      );
    }

    const newPassword = generateRandomPassword();

    const emailSent = await sendEmailRecoverPassword(email, newPassword);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, data: null, error: t("Auth.Route.emailSendError") },
        { status: 500 }
      );
    }

    const user = await userRecoverPassword(email, newPassword);

    if (!user.success || user.error || !user.data) {
      return NextResponse.json(
        { success: false, data: null, error: user.error || t("User.Route.userChangePasswordError") },
        { status: 500 }
      );
    }

    const userName = await getUserNameById(user.data);
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
      userId: user.data,
      message: `EventLog.logMessage.changePassword|${userFullName}`,
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
        data: null,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in GET /api/user/list:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
