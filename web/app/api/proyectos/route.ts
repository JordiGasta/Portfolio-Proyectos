import { NextResponse } from "next/server";
import type { Proyecto } from "@/types/proyecto";
import {
  leerProyectosLocales,
  guardarProyectosLocales,
} from "@/lib/proyectos/almacenLocal";
import { sharePointEstaConfigurado } from "@/lib/sharepoint/configuracion";
import { leerProyectosDesdeExcel } from "@/lib/sharepoint/excelCapex";

export async function GET() {
  const configurado = sharePointEstaConfigurado();

  if (!configurado) {
    const proyectos = await leerProyectosLocales();
    return NextResponse.json({ origen: "ficticio", proyectos });
  }

  try {
    const proyectos = await leerProyectosDesdeExcel();
    return NextResponse.json({ origen: "sharepoint-excel", proyectos });
  } catch (error) {
    const proyectos = await leerProyectosLocales();
    return NextResponse.json({
      origen: "error",
      mensaje:
        error instanceof Error
          ? error.message
          : "Error desconocido al leer el Excel de SharePoint.",
      proyectos,
    });
  }
}

/**
 * Crear proyectos manualmente solo está soportado sobre el almacén
 * local. Cuando la fuente de datos es el Excel de SharePoint, la
 * aplicación es de solo lectura para esa fuente (el Excel se sigue
 * editando directamente en SharePoint).
 */
export async function POST(request: Request) {
  const proyecto = (await request.json()) as Proyecto;
  const proyectos = await leerProyectosLocales();
  const actualizados = [...proyectos, proyecto];
  await guardarProyectosLocales(actualizados);

  if (sharePointEstaConfigurado()) {
    return NextResponse.json({
      origen: "sharepoint-solo-lectura",
      aviso: "La fuente de datos real (Excel de SharePoint) es de solo lectura desde la app. El proyecto se ha guardado solo en el almacén local de desarrollo.",
      proyecto,
    });
  }

  return NextResponse.json({ origen: "ficticio", proyecto });
}
