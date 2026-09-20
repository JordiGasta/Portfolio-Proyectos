import { NextResponse } from "next/server";
import { leerProyectosDesdeSharePoint } from "@/lib/sharepoint/leerProyectos";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";
import { businessCentralEstaConfigurado } from "@/lib/businesscentral/configuracion";
import {
  obtenerActualsDesdeBC,
  obtenerComprometidoDesdeBC,
} from "@/lib/businesscentral/actuals";

interface ElementoListaSharePoint {
  id: string;
  fields: { ProjectID?: string };
}

async function buscarIdElementoPorCodigo(
  siteId: string,
  listId: string,
  codigo: string,
): Promise<string | null> {
  const datos = (await llamarGraph(
    `/sites/${siteId}/lists/${listId}/items?expand=fields`,
  )) as { value: ElementoListaSharePoint[] };

  const encontrado = datos.value.find(
    (item) => item.fields.ProjectID === codigo,
  );

  return encontrado ? encontrado.id : null;
}

export async function POST() {
  if (!businessCentralEstaConfigurado()) {
    return NextResponse.json({
      configurado: false,
      aviso: "La conexión con Business Central no está configurada todavía.",
      actualizaciones: [],
    });
  }

  const proyectos = await leerProyectosDesdeSharePoint();
  const conCostCenter = proyectos.filter((p) => p.costCenter);

  const spConfigurado = sharePointEstaConfigurado();
  const configSP = spConfigurado ? obtenerConfiguracionSharePoint()! : null;

  const actualizaciones: Array<{
    codigo: string;
    ok: boolean;
    detalle: string;
    gastado?: number;
    comprometido?: number;
    mensual2026?: number[];
    guardadoEnSharePoint?: boolean;
  }> = [];

  for (const proyecto of conCostCenter) {
    try {
      const [actuals, comprometido] = await Promise.all([
        obtenerActualsDesdeBC(proyecto.codigo, proyecto.costCenter!),
        obtenerComprometidoDesdeBC(proyecto.codigo, proyecto.costCenter!),
      ]);

      let guardadoEnSharePoint = false;

      if (configSP) {
        try {
          const idElemento = await buscarIdElementoPorCodigo(
            configSP.siteId,
            configSP.listId,
            proyecto.codigo,
          );

          if (idElemento) {
            await llamarGraph(
              `/sites/${configSP.siteId}/lists/${configSP.listId}/items/${idElemento}/fields`,
              {
                method: "PATCH",
                body: JSON.stringify({
                  Actuals: actuals.total,
                  ImporteComprometido: comprometido,
                }),
              },
            );
            guardadoEnSharePoint = true;
          }
        } catch {
          // Si falla el guardado en SharePoint, seguimos devolviendo
          // el dato real de BC igualmente.
        }
      }

      actualizaciones.push({
        codigo: proyecto.codigo,
        ok: true,
        detalle: "Actualizado",
        gastado: actuals.total,
        comprometido,
        mensual2026: actuals.mensual2026,
        guardadoEnSharePoint,
      });
    } catch (error) {
      actualizaciones.push({
        codigo: proyecto.codigo,
        ok: false,
        detalle: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  return NextResponse.json({ configurado: true, actualizaciones });
}
