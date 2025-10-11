import { createEventLog } from "@/features/eventLog/data";
import { assignJuniorToResearcher, getUserNameById, userExistsById } from "@/features/user/data";
import { assignResearcherFormSchema } from "@/features/user/schemas";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const body = await request.json();
    const data = assignResearcherFormSchema(t).parse(body);
    const { userId, researcherId } = data;

    const { isCategory } = await hasCategory("ADMIN");
    if (!isCategory) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.unauthorized") },
        { status: 403 }
      );
    }

    const junior = await userExistsById(userId);
    const researcher = await userExistsById(researcherId);

    if (!junior || !researcher) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.userNotFound") },
        { status: 404 }
      );
    }

    const isAssigned = await assignJuniorToResearcher(userId, researcherId);

    if (!isAssigned || isAssigned.error || !isAssigned.success) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.unassignedToResearcher") },
        { status: 500 }
      );
    }

    const userName = await getUserNameById(userId);
    const researcherName = await getUserNameById(researcherId);

    if (userName.error || !userName.success || !userName.data || !researcherName.success || researcherName.error || !researcherName.data) {
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
    const researcherFullName = getFullName(
      researcherName.data.firstSurname ?? undefined,
      researcherName.data.secondSurname ?? undefined,
      researcherName.data.name ?? undefined
    );

    if (!userName || !researcherName || userName.error || researcherName.error) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.userNotFound") },
        { status: 500 }
      );
    }

    const log = await createEventLog({
      eventType: "USER_ASSIGNED_MENTOR",
      userId,
      message: `EventLog.logMessage.user_assigned_mentor|${userFullName}|${researcherFullName}`,
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
