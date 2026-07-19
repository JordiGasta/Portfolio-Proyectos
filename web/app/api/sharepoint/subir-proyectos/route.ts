import { NextResponse } from "next/server";
import { leerProyectosLocales } from "@/lib/proyectos/almacenLocal";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";
import { proyectoAFieldsSharePoint } from "@/lib/sharepoint/mapeoLista";

/**
 * Utilidad de subida. Acepta un parámetro opcional "solo" en la URL
 * (lista de códigos separados por coma) para reintentar únicamente
 * proyectos concretos, sin duplicar los que ya se subieron bien.
 *
 * Ejemplo: /api/sharepoint/subir-proyectos?solo=P010,P015,P018
 */
export async function POST(request: Request) {
  if (!sharePointEstaConfigurado()) {
    return NextResponse.json(
      { error: "SharePoint no está configurado." },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const soloParam = searchParams.get("solo");
  const codigosFiltro = soloParam
    ? soloParam.split(",").map((c) => c.trim())
    : null;

  const config = obtenerConfiguracionSharePoint()!;
  let proyectos = await leerProyectosLocales();

  if (codigosFiltro) {
    proyectos = proyectos.filter((p) => codigosFiltro.includes(p.codigo));
  }

  const resultados: Array<{
    codigo: string;
    ok: boolean;
    detalle: string;
    camposEnviados?: Record<string, unknown>;
  }> = [];

  for (const proyecto of proyectos) {
    const fields = proyectoAFieldsSharePoint(proyecto);
    try {
      await llamarGraph(
        `/sites/${config.siteId}/lists/${config.listId}/items`,
        {
          method: "POST",
          body: JSON.stringify({ fields }),
        },
      );
      resultados.push({ codigo: proyecto.codigo, ok: true, detalle: "Creado" });
    } catch (error) {
      resultados.push({
        codigo: proyecto.codigo,
        ok: false,
        detalle: error instanceof Error ? error.message : "Error desconocido",
        camposEnviados: fields,
      });
    }
  }

  const exitos = resultados.filter((r) => r.ok).length;

  return NextResponse.json({
    totalIntentados: proyectos.length,
    exitos,
    fallos: resultados.length - exitos,
    resultados,
  });
}
