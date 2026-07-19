import { NextResponse } from "next/server";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

/**
 * Valores reales de carryover (columna "Carryover 2025 + New
 * Projects 2026" del Excel original), por código de proyecto.
 */
const CARRYOVER_POR_CODIGO: Record<string, number> = {
  P009: 100548.39,
  P010: 985891.41,
  P012: 75000,
  P015: 144987.53,
  P018: 120986.08,
  P022: 1574605.36,
  P025: 57665.94,
  P029: 48591.93,
  P030: 30013.69,
  P034: 65000,
  P035: 40000,
  P036: 105000,
  P037: 86147.32,
};

interface ElementoListaSharePoint {
  id: string;
  fields: { ProjectID?: string };
}

/**
 * Utilidad de actualización ÚNICA: busca cada proyecto ya existente
 * en la lista de SharePoint por su ProjectID y le rellena (PATCH) el
 * campo Carryover2025 con su valor real, sin crear elementos nuevos.
 */
export async function POST() {
  if (!sharePointEstaConfigurado()) {
    return NextResponse.json(
      { error: "SharePoint no está configurado." },
      { status: 400 },
    );
  }

  const config = obtenerConfiguracionSharePoint()!;

  const datos = (await llamarGraph(
    `/sites/${config.siteId}/lists/${config.listId}/items?expand=fields`,
  )) as { value: ElementoListaSharePoint[] };

  const resultados: Array<{ codigo: string; ok: boolean; detalle: string }> = [];

  for (const item of datos.value) {
    const codigo = item.fields.ProjectID;
    if (!codigo || !(codigo in CARRYOVER_POR_CODIGO)) {
      continue;
    }

    try {
      await llamarGraph(
        `/sites/${config.siteId}/lists/${config.listId}/items/${item.id}/fields`,
        {
          method: "PATCH",
          body: JSON.stringify({
            Carryover2025: CARRYOVER_POR_CODIGO[codigo],
          }),
        },
      );
      resultados.push({ codigo, ok: true, detalle: "Actualizado" });
    } catch (error) {
      resultados.push({
        codigo,
        ok: false,
        detalle: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  const exitos = resultados.filter((r) => r.ok).length;

  return NextResponse.json({
    totalActualizados: resultados.length,
    exitos,
    fallos: resultados.length - exitos,
    resultados,
  });
}
