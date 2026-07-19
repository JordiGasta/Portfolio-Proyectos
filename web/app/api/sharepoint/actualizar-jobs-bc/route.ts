import { NextResponse } from "next/server";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

/**
 * Números de Job REALES de Business Central, por código de proyecto.
 *
 * TODO: rellenar con los valores que facilite Finanzas/IT cuando
 * concedan el acceso a Business Central. Mientras esté vacío, esta
 * ruta no actualiza nada (para no sobrescribir por error los valores
 * ficticios con datos vacíos).
 */
const JOB_BC_POR_CODIGO: Record<string, string> = {
  // P009: "J-2026-XXX",
  // P010: "J-2026-XXX",
  // P012: "J-2026-XXX",
  // P015: "J-2026-XXX",
  // P018: "J-2026-XXX",
  // P022: "J-2026-XXX",
  // P025: "J-2026-XXX",
  // P029: "J-2026-XXX",
  // P030: "J-2026-XXX",
  // P034: "J-2026-XXX",
  // P035: "J-2026-XXX",
  // P036: "J-2026-XXX",
  // P037: "J-2026-XXX",
};

interface ElementoListaSharePoint {
  id: string;
  fields: { ProjectID?: string };
}

/**
 * Utilidad de actualización ÚNICA: busca cada proyecto ya existente
 * en la lista de SharePoint por su ProjectID y le actualiza (PATCH)
 * el campo BCJobNumber con su número de Job real, sustituyendo el
 * valor ficticio ("BC-P009", etc.) por el real.
 */
export async function POST() {
  if (!sharePointEstaConfigurado()) {
    return NextResponse.json(
      { error: "SharePoint no está configurado." },
      { status: 400 },
    );
  }

  if (Object.keys(JOB_BC_POR_CODIGO).length === 0) {
    return NextResponse.json(
      {
        error:
          "JOB_BC_POR_CODIGO está vacío todavía. Rellena los números de Job reales en el código antes de ejecutar esta ruta.",
      },
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
    if (!codigo || !(codigo in JOB_BC_POR_CODIGO)) {
      continue;
    }

    try {
      await llamarGraph(
        `/sites/${config.siteId}/lists/${config.listId}/items/${item.id}/fields`,
        {
          method: "PATCH",
          body: JSON.stringify({
            BCJobNumber: JOB_BC_POR_CODIGO[codigo],
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
