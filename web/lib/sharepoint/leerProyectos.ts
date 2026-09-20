import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";
import { itemSharePointAProyecto } from "@/lib/sharepoint/mapeoLista";
import { leerProyectosLocales } from "@/lib/proyectos/almacenLocal";
import type { Proyecto } from "@/types/proyecto";

interface ElementoListaSharePoint {
  fields: Record<string, unknown>;
}

/**
 * Lee los proyectos reales desde la lista de SharePoint. Si
 * SharePoint no está configurado, o falla la conexión, cae de vuelta
 * al almacén local de desarrollo, para que la app nunca se quede sin
 * datos que mostrar.
 *
 * Se centraliza aquí para que todas las rutas (lectura normal de
 * proyectos, sincronización con Business Central, etc.) trabajen
 * siempre sobre los mismos datos actualizados, y no sobre copias
 * locales que puedan haberse quedado desfasadas.
 */
export async function leerProyectosDesdeSharePoint(): Promise<Proyecto[]> {
  if (!sharePointEstaConfigurado()) {
    return leerProyectosLocales();
  }

  try {
    const config = obtenerConfiguracionSharePoint()!;
    const datos = (await llamarGraph(
      `/sites/${config.siteId}/lists/${config.listId}/items?expand=fields`,
    )) as { value: ElementoListaSharePoint[] };

    if (datos.value.length === 0) {
      return leerProyectosLocales();
    }

    return datos.value.map((item) => itemSharePointAProyecto(item.fields));
  } catch {
    return leerProyectosLocales();
  }
}
