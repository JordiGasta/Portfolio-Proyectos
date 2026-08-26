import { NextResponse } from "next/server";
import { leerHistoricoCapex } from "@/lib/sharepoint/historicoCapex";
import { sharePointEstaConfigurado } from "@/lib/sharepoint/configuracion";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!sharePointEstaConfigurado()) {
    return NextResponse.json({ configurado: false, historico: [] });
  }

  try {
    const historico = await leerHistoricoCapex();
    return NextResponse.json({ configurado: true, historico });
  } catch (error) {
    return NextResponse.json({
      configurado: true,
      error: error instanceof Error ? error.message : "Error desconocido",
      historico: [],
    });
  }
}
