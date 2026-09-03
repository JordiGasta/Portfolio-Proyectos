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
import { proyectoAFieldsSharePoint } from "@/lib/sharepoint/mapeoLista";

interface ParametrosRuta {
  params: Promise<{ id: string }>;
}

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

export async function PUT(request: Request, { params }: ParametrosRuta) {
  const { id } = await params;
  const proyectoActualizado = (await request.json()) as Proyecto;

  if (!sharePointEstaConfigurado()) {
    const proyectos = await leerProyectosLocales();
    const actualizados = proyectos.map((proyecto) =>
      proyecto.id === id ? proyectoActualizado : proyecto,
    );
    await guardarProyectosLocales(actualizados);
    return NextResponse.json({ origen: "ficticio", proyecto: proyectoActualizado });
  }

  try {
    const config = obtenerConfiguracionSharePoint()!;
    const idElemento = await buscarIdElementoPorCodigo(
      config.siteId,
      config.listId,
      proyectoActualizado.codigo,
    );

    if (!idElemento) {
      throw new Error(
        `No se ha encontrado en SharePoint ningún proyecto con código ${proyectoActualizado.codigo}.`,
      );
    }

    await llamarGraph(
      `/sites/${config.siteId}/lists/${config.listId}/items/${idElemento}/fields`,
      {
        method: "PATCH",
        body: JSON.stringify(proyectoAFieldsSharePoint(proyectoActualizado)),
      },
    );

    return NextResponse.json({ origen: "sharepoint", proyecto: proyectoActualizado });
  } catch (error) {
    const proyectos = await leerProyectosLocales();
    const actualizados = proyectos.map((proyecto) =>
      proyecto.id === id ? proyectoActualizado : proyecto,
    );
    await guardarProyectosLocales(actualizados);

    return NextResponse.json({
      origen: "error",
      mensaje:
        error instanceof Error
          ? error.message
          : "Error desconocido al actualizar el proyecto en SharePoint.",
      aviso: "El cambio se ha guardado solo en el almacén local de desarrollo.",
      proyecto: proyectoActualizado,
    });
  }
}
