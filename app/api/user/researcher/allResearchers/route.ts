import { getAllResearchers } from "@/features/user/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const researchers = await getAllResearchers();

    return NextResponse.json({ researchers });

  } catch (error) {
    console.error("Error al obtener investigadores:", error);
    
    return NextResponse.json(
      { error: "Error al obtener investigadores" },
      { status: 500 }
    );
  }
}