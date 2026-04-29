import { NextResponse } from "next/server";
import { getUserNameById, userRecoverPassword } from "@/features/user/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { generateRandomPassword } from "@/lib/auth/generatePassword";
import { getFullName } from "@/features/user/utils";
import { createEventLog } from "@/features/eventLog/data";
import { sendEmailRecoverPassword } from "@/lib/services/resend/recoverPassword/recoverPassword";

/**
 * @openapi
 * {
 *   "description": "Generates a new password for a user and sends it by email.",
 *   "requestBody": {
 *     "required": true,
 *     "content": {
 *       "application/json": {
 *         "schema": {
 *           "type": "object",
 *           "required": ["email"],
 *           "properties": {
 *             "email": {
 *               "type": "string",
 *               "format": "email"
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "responses": {
 *     "201": {
 *       "description": "Password reset request processed successfully"
 *     },
 *     "400": {
 *       "description": "Invalid request payload"
 *     },
 *     "404": {
 *       "description": "User not found"
 *     }
 *   }
 * }
 */
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
    let userId: string | null = null;
    try {
      const user = await userRecoverPassword(email, newPassword);
      if (user.success && user.data) {
        userId = user.data;
      }
    } catch {
    }

    if (userId) {
      const emailSent = await sendEmailRecoverPassword(email, newPassword);
      if (emailSent) {
        try {
          const userName = await getUserNameById(userId);
          if (userName.success && userName.data) {
            const userFullName = getFullName(
              userName.data.firstSurname ?? undefined,
              userName.data.secondSurname ?? undefined,
              userName.data.name ?? undefined
            );
            await createEventLog({
              eventType: "USER_UPDATED",
              userId: userId,
              message: `EventLog.logMessage.changePassword|${userFullName}`,
            });
          }
        } catch {
        }
      }
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
