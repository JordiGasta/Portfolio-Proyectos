import { NextResponse } from "next/server";
import { leerProyectosLocales } from "@/lib/proyectos/almacenLocal";
import { businessCentralEstaConfigurado } from "@/lib/businesscentral/configuracion";
import {
  obtenerActualsDesdeBC,
  obtenerComprometidoDesdeBC,
} from "@/lib/businesscentral/actuals";

/**
 * Sincronización con la API interna de Business Central: para cada
 * proyecto con un centro de coste (costCenter) asignado, trae el
 * gasto real (CapexAccountMovs) y el comprometido (PurchaseLines).
 *
 * Mientras la conexión no esté configurada, devuelve un aviso claro
 * para que el resto de la app siga funcionando con normalidad.
 */
export async function POST() {
  if (!businessCentralEstaConfigurado()) {
    return NextResponse.json({
      configurado: false,
      aviso: "La conexión con Business Central no está configurada todavía.",
      actualizaciones: [],
    });
  }

  const proyectos = await leerProyectosLocales();
  const conCostCenter = proyectos.filter((p) => p.costCenter);

  const actualizaciones: Array<{
    codigo: string;
    ok: boolean;
    detalle: string;
    gastado?: number;
    comprometido?: number;
    mensual2026?: number[];
  }> = [];

  for (const proyecto of conCostCenter) {
    try {
      const [actuals, comprometido] = await Promise.all([
        obtenerActualsDesdeBC(proyecto.codigo, proyecto.costCenter!),
        obtenerComprometidoDesdeBC(proyecto.codigo, proyecto.costCenter!),
      ]);

      actualizaciones.push({
        codigo: proyecto.codigo,
        ok: true,
        detalle: "Actualizado",
        gastado: actuals.total,
        comprometido,
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
