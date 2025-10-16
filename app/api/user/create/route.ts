import { NextResponse } from "next/server";

import { hasCategory } from "@/lib/auth/hasCategory";
import { generateRandomPassword } from "@/lib/auth/generatePassword";
import { createUser, existsUserByEmail, getUserNameById } from "@/features/user/data";
import { createUserSchema } from "@/features/user/schemas";
import { createEventLog } from "@/features/eventLog/data";
import { getFullName } from "@/features/user/utils";
import { sendEmailCreateUser } from "@/lib/services/resend/CreateUser/createUser";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";

export async function POST(request: Request) {
  try {
    const { isCategory } = await hasCategory("ADMIN");

    const { t } = await getServerLanguage();

    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.unauthorized") },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createUserSchema(t).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.invalidValues") },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const exists = await existsUserByEmail(data.email);
    if (exists.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.userExists") },
        { status: 400 }
      );
    }

    const password = generateRandomPassword();

    const emailSent = await sendEmailCreateUser(data.email, password);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.emailSendError") },
        { status: 500 }
      );
    }

    const userCreated = await createUser(data, password);

    if (!userCreated.success || userCreated.error || !userCreated.data) {
      return NextResponse.json(
        { success: false, data: null, error: userCreated.error || t("User.Route.userCreateError") },
        { status: 500 }
      );
    }

    const userName = await getUserNameById(userCreated.data);
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
      eventType: "USER_CREATED",
      userId: userCreated.data,
      message: `EventLog.logMessage.user_created|${userFullName}`,
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
    console.error("Error in POST /api/user/create:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
