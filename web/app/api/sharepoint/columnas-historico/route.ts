import { NextResponse } from "next/server";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

const LIST_ID_HISTORICO = "23bf81be-71c0-4fe8-a906-411b4f6d4597";

export async function GET() {
  if (!sharePointEstaConfigurado()) {
    return NextResponse.json({ error: "SharePoint no configurado." }, { status: 400 });
  }

  const config = obtenerConfiguracionSharePoint()!;

  try {
    const datos = (await llamarGraph(
      `/sites/${config.siteId}/lists/${LIST_ID_HISTORICO}/columns`,
    )) as { value: Array<{ name: string; displayName: string }> };

    const columnas = datos.value.map((c) => ({
      nombreInterno: c.name,
      nombreVisible: c.displayName,
    }));

    return NextResponse.json({ columnas });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
