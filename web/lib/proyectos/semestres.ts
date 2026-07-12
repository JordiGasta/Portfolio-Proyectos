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

function semestreDeFecha(fechaIso: string | undefined): Semestre | null {
  if (!fechaIso) return null;
  const fecha = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return null;
  return { anio: fecha.getFullYear(), semestre: fecha.getMonth() < 6 ? 1 : 2 };
}

/** Semestre ancla: donde arrancan los datos reales de gasto mensual (S1 2026). */
const ANCLA: Semestre = { anio: 2026, semestre: 1 };

export function detectarSemestres(proyectos: Proyecto[]): Semestre[] {
  let maximo = indiceSemestre(ANCLA);

  proyectos.forEach((proyecto) => {
    const s = semestreDeFecha(proyecto.fechaFinPrevista);
    if (s) {
      maximo = Math.max(maximo, indiceSemestre(s));
    }
  });

  const minimo = indiceSemestre(ANCLA);
  const lista: Semestre[] = [];
  for (let i = minimo; i <= maximo; i += 1) {
    lista.push(semestreDesdeIndice(i));
  }
  return lista;
}

function sumaGastoMensual(proyecto: Proyecto): number {
  return (proyecto.gastoMensual2026 ?? []).reduce((t, v) => t + (v ?? 0), 0);
}

/**
 * Presupuesto disponible del proyecto al ENTRAR en 2026: el total
 * aprobado menos todo lo gastado antes de 2026 (histórico total menos
 * lo gastado dentro de 2026). Es lo que de verdad hay que repartir
 * entre los semestres de 2026 que se muestran en el gráfico — no el
 * presupuesto total del proyecto, que puede incluir gasto ya
 * ejecutado en años anteriores.
 */
function presupuestoDisponible2026(proyecto: Proyecto): number {
  const gastado2026 = sumaGastoMensual(proyecto);
  const gastadoAntesDe2026 = proyecto.importeGastado - gastado2026;
  return Math.max(0, proyecto.presupuestoAprobado - gastadoAntesDe2026);
}

function gastoEnSemestre(proyecto: Proyecto, semestre: Semestre): number {
  if (semestre.anio !== 2026) return 0;
  const meses = proyecto.gastoMensual2026 ?? [];
  const desde = semestre.semestre === 1 ? 0 : 6;
  const hasta = semestre.semestre === 1 ? 6 : 12;
  return meses.slice(desde, hasta).reduce((t, v) => t + (v ?? 0), 0);
}

function semestresDeEjecucion(proyecto: Proyecto): number {
  const finSemestre = semestreDeFecha(proyecto.fechaFinPrevista);
  if (!finSemestre) return 1;
  const duracion = indiceSemestre(finSemestre) - indiceSemestre(ANCLA) + 1;
  return Math.max(1, duracion);
}

/**
 * Para cada semestre visible:
 *  - Presupuesto: el presupuesto DISPONIBLE PARA 2026 del proyecto
 *    (total menos lo ya gastado antes de 2026) repartido a partes
 *    iguales entre los semestres que dura su ejecución dentro de la
 *    ventana mostrada (desde S1 2026 hasta su fecha de fin prevista).
 *  - Gastado: el gasto mensual real del proyecto en ese semestre.
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
      const finSemestre = semestreDeFecha(proyecto.fechaFinPrevista);
      const numSemestres = semestresDeEjecucion(proyecto);
      const disponible2026 = presupuestoDisponible2026(proyecto);

      const dentroDelRango =
        finSemestre &&
        indiceSemestre(semestre) >= indiceSemestre(ANCLA) &&
        indiceSemestre(semestre) <= indiceSemestre(finSemestre);

      const presupuestoSemestre = dentroDelRango
        ? disponible2026 / numSemestres
        : 0;

      const gastoSemestre = gastoEnSemestre(proyecto, semestre);

      presupuesto += presupuestoSemestre;
      gastado += gastoSemestre;

      if (presupuestoSemestre > 0 || gastoSemestre > 0) {
        contribuciones.push({
          proyecto,
          presupuesto: presupuestoSemestre,
          gastado: gastoSemestre,
        });
      }
    });

    contribuciones.sort((a, b) => b.presupuesto - a.presupuesto);
    return { semestre, presupuesto, gastado, contribuciones };
  });
}
