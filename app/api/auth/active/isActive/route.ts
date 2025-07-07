import { getUserByEmail } from "@/data/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }

    return NextResponse.json({ exists: true, isActive: user.isActive }, { status: 200 });
  } catch (error) {
    console.error("Error checking user active status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}