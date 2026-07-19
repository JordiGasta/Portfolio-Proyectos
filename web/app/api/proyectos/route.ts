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
import { itemSharePointAProyecto } from "@/lib/sharepoint/mapeoLista";

// Evita que Next.js cachee esta ruta: siempre debe consultar datos en vivo.
export const dynamic = "force-dynamic";

interface ElementoListaSharePoint {
  fields: Record<string, unknown>;
}

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

export async function POST(request: Request) {
  const proyecto = (await request.json()) as Proyecto;
  const proyectos = await leerProyectosLocales();
  const actualizados = [...proyectos, proyecto];
  await guardarProyectosLocales(actualizados);

  return NextResponse.json({ origen: "ficticio", proyecto });
}
