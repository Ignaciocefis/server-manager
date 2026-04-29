import { createEventLog } from "@/features/eventLog/data";
import { deleteUserById, getUserNameById, hasMoreThanOneAdmin } from "@/features/user/data";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

/**
 * @openapi
 * {
 *   "description": "Deletes an existing user by id.",
 *   "requestBody": {
 *     "required": true,
 *     "content": {
 *       "application/json": {
 *         "schema": {
 *           "type": "object",
 *           "required": ["userId"],
 *           "properties": {
 *             "userId": { "type": "string" }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "responses": {
 *     "400": { "description": "Invalid userId" },
 *     "403": { "description": "Unauthorized" },
 *     "404": { "description": "User not found" }
 *   }
 * }
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    const { t } = await getServerLanguage();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.userIdInvalid") },
        { status: 400 }
      );
    }

    const { isCategory } = await hasCategory("ADMIN");
    if (!isCategory) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.unauthorized") },
        { status: 403 }
      );
    }

    const isMoreThanOneAdmin = await hasMoreThanOneAdmin();
    if (isCategory && !isMoreThanOneAdmin.data) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.atLeastOneAdmin") },
        { status: 400 }
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
      eventType: "USER_DELETED",
      userId: userId,
      message: `EventLog.logMessage.user_deleted|${userFullName}`,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.createEventLogError") },
        { status: 500 }
      );
    }

    const deleted = await deleteUserById(userId);

    if (!deleted || deleted.error || !deleted.success) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.userDeleteError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: null, success: true, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/user/delete:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
