import { NextResponse } from "next/server";
import type { Proyecto } from "@/types/proyecto";
import {
  leerProyectosLocales,
  guardarProyectosLocales,
} from "@/lib/proyectos/almacenLocal";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

export async function GET() {
  const configurado = sharePointEstaConfigurado();

  if (!configurado) {
    const proyectos = await leerProyectosLocales();
    return NextResponse.json({ origen: "ficticio", proyectos });
  }

  try {
    const config = obtenerConfiguracionSharePoint();
    const datos = (await llamarGraph(
      `/sites/${config!.siteId}/lists/${config!.listId}/items?expand=fields`,
    )) as { value: unknown[] };

    const proyectos = await leerProyectosLocales();

    return NextResponse.json({
      origen: "sharepoint",
      totalElementosSharePoint: datos.value.length,
      avisoMapeo:
        "Conexión correcta. El mapeo de campos de SharePoint al modelo de la aplicación todavía no está implementado; se sigue devolviendo el listado local.",
      proyectos,
    });
  } catch (error) {
    const proyectos = await leerProyectosLocales();
    return NextResponse.json({
      origen: "error",
      mensaje:
        error instanceof Error
          ? error.message
          : "Error desconocido al conectar con SharePoint.",
      proyectos,
    });
  }
}

export async function POST(request: Request) {
  const proyecto = (await request.json()) as Proyecto;
  const proyectos = await leerProyectosLocales();
  const actualizados = [...proyectos, proyecto];
  await guardarProyectosLocales(actualizados);

  return NextResponse.json({ origen: "ficticio", proyecto });
}
