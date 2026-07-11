import type { Proyecto } from "@/types/proyecto";

export interface Semestre {
  anio: number;
  semestre: 1 | 2;
}

export interface ContribucionProyectoSemestre {
  proyecto: Proyecto;
  presupuesto: number;
  gastado: number;
}

export interface DatosSemestre {
  semestre: Semestre;
  presupuesto: number;
  gastado: number;
  contribuciones: ContribucionProyectoSemestre[];
}

export function etiquetaSemestre(semestre: Semestre): string {
  return `S${semestre.semestre} ${semestre.anio}`;
}

function indiceSemestre(s: Semestre): number {
  return s.anio * 2 + (s.semestre - 1);
}

function semestreDesdeIndice(idx: number): Semestre {
  return { anio: Math.floor(idx / 2), semestre: ((idx % 2) + 1) as 1 | 2 };
}

function mismoSemestre(a: Semestre, b: Semestre): boolean {
  return a.anio === b.anio && a.semestre === b.semestre;
}

/** Semestre de una fecha ISO. Corte 30 junio: ene–jun = S1, jul–dic = S2. */
function semestreDeFecha(fechaIso: string | undefined): Semestre | null {
  if (!fechaIso) return null;
  const fecha = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return null;
  return { anio: fecha.getFullYear(), semestre: fecha.getMonth() < 6 ? 1 : 2 };
}

/**
 * Detecta automáticamente todos los semestres que aparecen en los
 * datos: fechas de fin de fase (presupuesto) y meses con gasto en
 * 2026. Devuelve la lista continua de semestres, del más antiguo al
 * más reciente.
 */
export function detectarSemestres(proyectos: Proyecto[]): Semestre[] {
  const indices: number[] = [];

  proyectos.forEach((proyecto) => {
    // Fechas de fin de fase (presupuesto).
    Object.values(proyecto.detallePorFase).forEach((detalle) => {
      const s = semestreDeFecha(detalle?.fechaFin);
      if (s) indices.push(indiceSemestre(s));
    });

    // Meses con gasto en 2026.
    const meses = proyecto.gastoMensual2026 ?? [];
    if (meses.slice(0, 6).some((m) => m > 0)) {
      indices.push(indiceSemestre({ anio: 2026, semestre: 1 }));
    }
    if (meses.slice(6, 12).some((m) => m > 0)) {
      indices.push(indiceSemestre({ anio: 2026, semestre: 2 }));
    }
  });

  if (indices.length === 0) {
    const anio = new Date().getFullYear();
    return [
      { anio, semestre: 1 },
      { anio, semestre: 2 },
    ];
  }

  const minimo = Math.min(...indices);
  const maximo = Math.max(...indices);
  const lista: Semestre[] = [];
  for (let i = minimo; i <= maximo; i += 1) {
    lista.push(semestreDesdeIndice(i));
  }
  return lista;
}

/** Gasto de un proyecto en un semestre (solo hay gasto mensual de 2026). */
function gastoEnSemestre(proyecto: Proyecto, semestre: Semestre): number {
  if (semestre.anio !== 2026) return 0;
  const meses = proyecto.gastoMensual2026 ?? [];
  const desde = semestre.semestre === 1 ? 0 : 6;
  const hasta = semestre.semestre === 1 ? 6 : 12;
  return meses.slice(desde, hasta).reduce((t, v) => t + (v ?? 0), 0);
}

/**
 * Para cada semestre:
 *  - Presupuesto: suma del coste de las fases cuya fecha de fin cae en
 *    ese semestre.
 *  - Gastado: suma del gasto mensual del proyecto en ese semestre.
 */
export function calcularDatosPorSemestre(
  proyectos: Proyecto[],
  semestres: Semestre[],
): DatosSemestre[] {
  return semestres.map((semestre) => {
    let presupuesto = 0;
    let gastado = 0;
    const contribuciones: ContribucionProyectoSemestre[] = [];

    proyectos.forEach((proyecto) => {
      let presupuestoProyecto = 0;
      Object.values(proyecto.detallePorFase).forEach((detalle) => {
        if (!detalle?.coste || !detalle.fechaFin) return;
        const s = semestreDeFecha(detalle.fechaFin);
        if (s && mismoSemestre(s, semestre)) {
          presupuestoProyecto += detalle.coste;
        }
      });

      const gastoProyecto = gastoEnSemestre(proyecto, semestre);

      presupuesto += presupuestoProyecto;
      gastado += gastoProyecto;

      if (presupuestoProyecto > 0 || gastoProyecto > 0) {
        contribuciones.push({
          proyecto,
          presupuesto: presupuestoProyecto,
          gastado: gastoProyecto,
        });
      }
    });

    contribuciones.sort((a, b) => b.presupuesto - a.presupuesto);
    return { semestre, presupuesto, gastado, contribuciones };
  });
}
