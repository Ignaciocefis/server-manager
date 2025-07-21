import { getUserAccessibleServers } from "@/features/server/data";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "El id es obligatorio" }, { status: 400 });
    }

    const serverList = await getUserAccessibleServers(id);

    return NextResponse.json(serverList);
    
  } catch (error) {
    console.error("Error fetching server list:", error);
    return NextResponse.json({ error: "Error fetching server list" }, { status: 500 });
  }
}