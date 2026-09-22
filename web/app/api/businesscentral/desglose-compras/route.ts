import { NextResponse } from "next/server";
import { leerProyectosDesdeSharePoint } from "@/lib/sharepoint/leerProyectos";
import { businessCentralEstaConfigurado } from "@/lib/businesscentral/configuracion";
import { obtenerDesgloseComprasDesdeBC } from "@/lib/businesscentral/actuals";

export async function GET(request: Request) {
  if (!businessCentralEstaConfigurado()) {
    return NextResponse.json({ configurado: false, proyectos: [] });
  }

  const { searchParams } = new URL(request.url);
  const anio = Number(searchParams.get("anio")) || new Date().getFullYear();

  const proyectos = await leerProyectosDesdeSharePoint();
  const conCostCenter = proyectos.filter((p) => p.costCenter);

  const resultados = await Promise.all(
    conCostCenter.map(async (proyecto) => {
      try {
        const desglose = await obtenerDesgloseComprasDesdeBC(
          proyecto.codigo,
          proyecto.costCenter!,
          anio,
        );
        return { codigo: proyecto.codigo, ok: true, ...desglose };
      } catch (error) {
        return {
          codigo: proyecto.codigo,
          ok: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    }),
  );

  return NextResponse.json({ configurado: true, proyectos: resultados });
}
