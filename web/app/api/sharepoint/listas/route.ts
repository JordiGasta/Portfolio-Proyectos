import { NextResponse } from "next/server";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

export async function GET() {
  if (!sharePointEstaConfigurado()) {
    return NextResponse.json({ error: "SharePoint no configurado." }, { status: 400 });
  }

  const config = obtenerConfiguracionSharePoint()!;

  try {
    const datos = (await llamarGraph(
      `/sites/${config.siteId}/lists`,
    )) as { value: Array<{ id: string; name: string; displayName: string }> };

    const listas = datos.value.map((l) => ({
      nombreInterno: l.name,
      nombreVisible: l.displayName,
      id: l.id,
    }));

    return NextResponse.json({ listas });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
