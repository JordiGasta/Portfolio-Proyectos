import { NextResponse } from "next/server";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

interface ColumnaSharePoint {
  name: string;
  displayName: string;
  [clave: string]: unknown;
}

/**
 * Ruta temporal de diagnóstico. Sin parámetros, lista todas las
 * columnas (nombre interno y visible). Con ?nombre=Tipo, devuelve el
 * detalle completo de esa columna (filtrado en el propio código, ya
 * que el $filter de Graph no funciona de forma fiable en este
 * endpoint).
 */
export async function GET(request: Request) {
  if (!sharePointEstaConfigurado()) {
    return NextResponse.json({ error: "SharePoint no configurado." }, { status: 400 });
  }

  const config = obtenerConfiguracionSharePoint()!;
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get("nombre");

  try {
    const datos = (await llamarGraph(
      `/sites/${config.siteId}/lists/${config.listId}/columns`,
    )) as { value: ColumnaSharePoint[] };

    if (nombre) {
      const columna = datos.value.find(
        (c) => c.name === nombre || c.displayName === nombre,
      );
      return NextResponse.json({ columna: columna ?? null });
    }

    const columnas = datos.value.map((c) => ({
      nombreInterno: c.name,
      nombreVisible: c.displayName,
    }));

    return NextResponse.json({ columnas });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
