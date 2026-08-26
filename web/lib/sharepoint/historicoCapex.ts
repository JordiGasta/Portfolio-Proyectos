import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

export interface FilaHistoricoCapex {
  projectId: string;
  anio: number;
  presupuestoAnual: number;
  gastadoAnual: number;
}

interface ElementoListaSharePoint {
  fields: {
    ProjectID?: string;
    A_x00f1_o?: number;
    PresupuestoAnual?: number;
    GastadoAnual?: number;
  };
}

/**
 * Lee TODAS las filas de la lista HistoricoCapexAnual. Cada fila
 * representa el presupuesto y gasto real de un proyecto en un año
 * concreto, decidido manualmente por Finanzas — la app nunca calcula
 * ni estima estos valores, solo los muestra tal cual están guardados.
 */
export async function leerHistoricoCapex(): Promise<FilaHistoricoCapex[]> {
  if (!sharePointEstaConfigurado()) {
    return [];
  }

  const config = obtenerConfiguracionSharePoint()!;

  const datos = (await llamarGraph(
    `/sites/${config.siteId}/lists/${config.listaHistoricoId}/items?expand=fields`,
  )) as { value: ElementoListaSharePoint[] };

  return datos.value
    .filter((item) => item.fields.ProjectID && item.fields.A_x00f1_o)
    .map((item) => ({
      projectId: item.fields.ProjectID!,
      anio: item.fields.A_x00f1_o!,
      presupuestoAnual: item.fields.PresupuestoAnual ?? 0,
      gastadoAnual: item.fields.GastadoAnual ?? 0,
    }));
}

/**
 * Crea una fila nueva en HistoricoCapexAnual para un proyecto y año
 * concretos. Se usa una vez al año (normalmente en enero) para dar
 * de alta el presupuesto de ese ejercicio; las filas de años
 * anteriores nunca se tocan ni se sobrescriben.
 */
export async function crearFilaHistoricoCapex(
  fila: FilaHistoricoCapex,
): Promise<void> {
  const config = obtenerConfiguracionSharePoint();
  if (!config) {
    throw new Error("SharePoint no está configurado.");
  }

  await llamarGraph(
    `/sites/${config.siteId}/lists/${config.listaHistoricoId}/items`,
    {
      method: "POST",
      body: JSON.stringify({
        fields: {
          Title: `${fila.projectId}-${fila.anio}`,
          ProjectID: fila.projectId,
          A_x00f1_o: fila.anio,
          PresupuestoAnual: fila.presupuestoAnual,
          GastadoAnual: fila.gastadoAnual,
        },
      }),
    },
  );
}
