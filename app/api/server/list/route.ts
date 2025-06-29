import { getUserServers } from "@/data/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "El id es obligatorio" }, { status: 400 });
    }

    const serverList = await getUserServers(id);

    return NextResponse.json(serverList);
    
  } catch (error) {
    console.error("Error fetching server list:", error);
    return NextResponse.json({ error: "Error fetching server list" }, { status: 500 });
  }
}