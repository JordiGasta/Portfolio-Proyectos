import { NextResponse } from "next/server";
import { proyectos as proyectosFicticios } from "@/lib/data/proyectos";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

/**
 * Ruta de API que devuelve la lista de proyectos.
 *
 * Si SharePoint está configurado (variables de entorno presentes),
 * consulta la lista real vía Microsoft Graph. Si no, devuelve los
 * datos ficticios, para que la aplicación siga funcionando mientras
 * se completa la configuración de credenciales y permisos.
 *
 * NOTA: el mapeo de los campos reales de SharePoint al modelo de la
 * aplicación se implementará en el incremento de migración de datos;
 * por ahora, si SharePoint está configurado, esta ruta solo confirma
 * que la conexión funciona devolviendo el número de elementos.
 */
export async function GET() {
  const configurado = sharePointEstaConfigurado();

  if (!configurado) {
    return NextResponse.json({
      origen: "ficticio",
      proyectos: proyectosFicticios,
    });
  }

  try {
    const config = obtenerConfiguracionSharePoint();
    const datos = (await llamarGraph(
      `/sites/${config!.siteId}/lists/${config!.listId}/items?expand=fields`,
    )) as { value: unknown[] };

    return NextResponse.json({
      origen: "sharepoint",
      totalElementosSharePoint: datos.value.length,
      avisoMapeo:
        "Conexión correcta. El mapeo de campos de SharePoint al modelo de la aplicación se implementará en el siguiente incremento.",
      proyectos: proyectosFicticios,
    });
  } catch (error) {
    return NextResponse.json(
      {
        origen: "error",
        mensaje:
          error instanceof Error ? error.message : "Error desconocido al conectar con SharePoint.",
        proyectos: proyectosFicticios,
      },
      { status: 200 },
    );
  }
}
