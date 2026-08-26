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
import {
  itemSharePointAProyecto,
  proyectoAFieldsSharePoint,
} from "@/lib/sharepoint/mapeoLista";

interface ElementoListaSharePoint {
  fields: Record<string, unknown>;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const configurado = sharePointEstaConfigurado();

  if (!configurado) {
    const proyectos = await leerProyectosLocales();
    return NextResponse.json({ origen: "ficticio", proyectos });
  }

  try {
    const config = obtenerConfiguracionSharePoint()!;
    const datos = (await llamarGraph(
      `/sites/${config.siteId}/lists/${config.listId}/items?expand=fields`,
    )) as { value: ElementoListaSharePoint[] };

    if (datos.value.length === 0) {
      const proyectos = await leerProyectosLocales();
      return NextResponse.json({
        origen: "sharepoint-vacio",
        aviso:
          "La lista de SharePoint está conectada pero vacía. Usa la utilidad de subida para poblarla con los proyectos reales.",
        proyectos,
      });
    }

    const proyectos = datos.value.map((item) =>
      itemSharePointAProyecto(item.fields),
    );

    return NextResponse.json({ origen: "sharepoint", proyectos });
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

/**
 * Crea un proyecto nuevo.
 *
 * Si SharePoint está configurado, se crea directamente como elemento
 * nuevo en la lista real. Si no, se guarda en el almacén local de
 * desarrollo (comportamiento anterior, sin cambios).
 */
export async function POST(request: Request) {
  const proyecto = (await request.json()) as Proyecto;

  if (!sharePointEstaConfigurado()) {
    const proyectos = await leerProyectosLocales();
    const actualizados = [...proyectos, proyecto];
    await guardarProyectosLocales(actualizados);
    return NextResponse.json({ origen: "ficticio", proyecto });
  }

  try {
    const config = obtenerConfiguracionSharePoint()!;
    await llamarGraph(
      `/sites/${config.siteId}/lists/${config.listId}/items`,
      {
        method: "POST",
        body: JSON.stringify({ fields: proyectoAFieldsSharePoint(proyecto) }),
      },
    );

    return NextResponse.json({ origen: "sharepoint", proyecto });
  } catch (error) {
    // Si falla la escritura en SharePoint, no perdemos el proyecto:
    // lo guardamos en el almacén local como red de seguridad, y lo
    // indicamos claramente en la respuesta.
    const proyectos = await leerProyectosLocales();
    const actualizados = [...proyectos, proyecto];
    await guardarProyectosLocales(actualizados);

    return NextResponse.json({
      origen: "error",
      mensaje:
        error instanceof Error
          ? error.message
          : "Error desconocido al crear el proyecto en SharePoint.",
      aviso: "El proyecto se ha guardado solo en el almacén local de desarrollo.",
      proyecto,
    });
  }
}
