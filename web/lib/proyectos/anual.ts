import type { Proyecto } from "@/types/proyecto";

export interface ContribucionProyectoAnio {
  proyecto: Proyecto;
  presupuesto: number;
  gastado: number;
}

export interface DatosAnio {
  anio: number;
  presupuesto: number;
  gastado: number;
  contribuciones: ContribucionProyectoAnio[];
}

function sumaGastoMensual(proyecto: Proyecto): number {
  return (proyecto.gastoMensual2026 ?? []).reduce((t, v) => t + (v ?? 0), 0);
}

function anioDeFecha(fechaIso: string | undefined): number | null {
  if (!fechaIso) return null;
  const fecha = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.getFullYear();
}

/**
 * Gastado histórico de un proyecto en 2025: el total gastado menos lo
 * gastado dentro de 2026 (los 12 meses de los que sí tenemos
 * desglose). Se asume que todo el gasto anterior a 2026 ocurrió en
 * 2025 (no hay datos de años anteriores en el Excel).
 */
function gastado2025(proyecto: Proyecto): number {
  return Math.max(0, proyecto.importeGastado - sumaGastoMensual(proyecto));
}

/**
 * Presupuesto disponible del proyecto al entrar en 2026: el total
 * aprobado menos lo gastado antes de 2026.
 */
function presupuestoDisponible2026(proyecto: Proyecto): number {
  // Usa directamente el carryover real (columna "Carryover 2025" de
  // SharePoint), en vez de derivarlo del gasto mensual, que no está
  // disponible para los proyectos leídos desde SharePoint.
  return proyecto.carryover2025 ?? 0;
}

/** Detecta los años a mostrar: 2025 fijo, y desde 2026 hasta la fecha de fin prevista más lejana. */
export function detectarAnios(proyectos: Proyecto[]): number[] {
  let maximo = 2026;
  proyectos.forEach((proyecto) => {
    const anio = anioDeFecha(proyecto.fechaFinPrevista);
    if (anio) maximo = Math.max(maximo, anio);
  });

  const lista: number[] = [];
  for (let a = 2025; a <= maximo; a += 1) lista.push(a);
  return lista;
}

/**
 * Para cada año:
 *  - 2025: presupuesto = gastado (año histórico cerrado, no se
 *    conoce un presupuesto anual distinto, así que se igualan).
 *  - 2026: presupuesto = disponible para 2026 (repartido a partes
 *    iguales entre 2026 y los años posteriores si el proyecto
 *    termina más tarde); gastado = suma real de los 12 meses.
 *  - Años posteriores a 2026 (si los hay): mismo reparto que 2026,
 *    sin datos de gasto todavía.
 */
export function calcularDatosPorAnio(
  proyectos: Proyecto[],
  anios: number[],
): DatosAnio[] {
  return anios.map((anio) => {
    let presupuesto = 0;
    let gastado = 0;
    const contribuciones: ContribucionProyectoAnio[] = [];

    proyectos.forEach((proyecto) => {
      let presupuestoAnio = 0;
      let gastadoAnio = 0;

      if (anio === 2025) {
        const g2025 = gastado2025(proyecto);
        presupuestoAnio = g2025;
        gastadoAnio = g2025;
      } else {
        const anioFin = anioDeFecha(proyecto.fechaFinPrevista) ?? 2026;
        const inicioReparto = 2026;
        const finReparto = Math.max(inicioReparto, anioFin);
        const numAnios = finReparto - inicioReparto + 1;

        if (anio >= inicioReparto && anio <= finReparto) {
          presupuestoAnio = presupuestoDisponible2026(proyecto) / numAnios;
        }

        if (anio === 2026) {
          gastadoAnio = sumaGastoMensual(proyecto);
        }
      }

      presupuesto += presupuestoAnio;
      gastado += gastadoAnio;

      if (presupuestoAnio > 0 || gastadoAnio > 0) {
        contribuciones.push({ proyecto, presupuesto: presupuestoAnio, gastado: gastadoAnio });
      }
    });

    contribuciones.sort((a, b) => b.presupuesto - a.presupuesto);
    return { anio, presupuesto, gastado, contribuciones };
  });
}

/** Gasto mes a mes de un proyecto en un año concreto. Solo hay datos reales para 2026. */
export function gastoMensualDeAnio(proyecto: Proyecto, anio: number): number[] | null {
  if (anio !== 2026) return null;
  return proyecto.gastoMensual2026 ?? null;
}

export const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
