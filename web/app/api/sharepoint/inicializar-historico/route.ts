import { NextResponse } from "next/server";
import { sharePointEstaConfigurado } from "@/lib/sharepoint/configuracion";
import { crearFilaHistoricoCapex } from "@/lib/sharepoint/historicoCapex";

/**
 * Valores de presupuesto 2026 ya validados anteriormente (el
 * carryover real de cada proyecto, extraído del Excel original), y
 * gastado 2026 (suma de los meses reales de enero a junio conocidos).
 *
 * Utilidad de inicialización ÚNICA: crea la primera fila (año 2026)
 * de HistoricoCapexAnual para cada uno de los 13 proyectos. Volver a
 * ejecutarla crea filas duplicadas si ya existen.
 */
const DATOS_2026: Record<string, { presupuesto: number; gastado: number }> = {
  P009: { presupuesto: 100548.39, gastado: 152053.6 },
  P010: { presupuesto: 985891.41, gastado: 324154.41 },
  P012: { presupuesto: 75000, gastado: 0 },
  P015: { presupuesto: 144987.53, gastado: 151321.29 },
  P018: { presupuesto: 120986.08, gastado: 111837.63 },
  P022: { presupuesto: 1574605.36, gastado: 728678.35 },
  P025: { presupuesto: 57665.94, gastado: 45570.86 },
  P029: { presupuesto: 48591.93, gastado: 33835.15 },
  P030: { presupuesto: 30013.69, gastado: 23407.7 },
  P034: { presupuesto: 65000, gastado: 0 },
  P035: { presupuesto: 40000, gastado: 41025.13 },
  P036: { presupuesto: 105000, gastado: 0 },
  P037: { presupuesto: 86147.32, gastado: 0 },
};

export async function POST() {
  if (!sharePointEstaConfigurado()) {
    return NextResponse.json(
      { error: "SharePoint no está configurado." },
      { status: 400 },
    );
  }

  const resultados: Array<{ codigo: string; ok: boolean; detalle: string }> = [];

  for (const [codigo, datos] of Object.entries(DATOS_2026)) {
    try {
      await crearFilaHistoricoCapex({
        projectId: codigo,
        anio: 2026,
        presupuestoAnual: datos.presupuesto,
        gastadoAnual: datos.gastado,
      });
      resultados.push({ codigo, ok: true, detalle: "Fila 2026 creada" });
    } catch (error) {
      resultados.push({
        codigo,
        ok: false,
        detalle: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  const exitos = resultados.filter((r) => r.ok).length;

  return NextResponse.json({
    totalIntentados: resultados.length,
    exitos,
    fallos: resultados.length - exitos,
    resultados,
  });
}
