import { NextResponse } from "next/server";
import { leerProyectosLocales } from "@/lib/proyectos/almacenLocal";
import { businessCentralEstaConfigurado } from "@/lib/businesscentral/configuracion";
import { obtenerActualsDesdeBC } from "@/lib/businesscentral/actuals";

/**
 * Sincronización con Business Central: para cada proyecto con un
 * número de Job de BC asignado, trae el gasto real (total y
 * desglose mensual de 2026) y lo devuelve para que el frontend
 * actualice su vista.
 *
 * Mientras Business Central no esté configurado, devuelve un aviso
 * claro en vez de fallar, para que el resto de la app siga
 * funcionando con normalidad (igual que con SharePoint).
 */
export async function POST() {
  if (!businessCentralEstaConfigurado()) {
    return NextResponse.json({
      configurado: false,
      aviso: "Business Central no está configurado todavía.",
      actualizaciones: [],
    });
  }

  const proyectos = await leerProyectosLocales();
  const conJobBC = proyectos.filter((p) => p.numeroJobBC);

  const actualizaciones: Array<{
    codigo: string;
    ok: boolean;
    detalle: string;
    total?: number;
    mensual2026?: number[];
  }> = [];

  for (const proyecto of conJobBC) {
    try {
      const actuals = await obtenerActualsDesdeBC(proyecto.numeroJobBC!);
      actualizaciones.push({
        codigo: proyecto.codigo,
        ok: true,
        detalle: "Actualizado",
        total: actuals.total,
        mensual2026: actuals.mensual2026,
      });
    } catch (error) {
      actualizaciones.push({
        codigo: proyecto.codigo,
        ok: false,
        detalle: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  return NextResponse.json({ configurado: true, actualizaciones });
}
