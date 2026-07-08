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

/**
 * Genera los 4 semestres a mostrar: S1 y S2 del año actual, y S1 y S2
 * del año siguiente.
 */
export function generarSemestres(anioBase: number = new Date().getFullYear()): Semestre[] {
  return [
    { anio: anioBase, semestre: 1 },
    { anio: anioBase, semestre: 2 },
    { anio: anioBase + 1, semestre: 1 },
    { anio: anioBase + 1, semestre: 2 },
  ];
}

/**
 * Devuelve a qué semestre pertenece una fecha ISO. El corte es el 30
 * de junio: enero–junio => S1, julio–diciembre => S2. Devuelve null
 * si la fecha no es válida o está vacía.
 */
function semestreDeFecha(fechaIso: string | undefined): Semestre | null {
  if (!fechaIso) {
    return null;
  }

  const fecha = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  const mes = fecha.getMonth(); // 0 = enero … 5 = junio, 6 = julio …
  return {
    anio: fecha.getFullYear(),
    semestre: mes < 6 ? 1 : 2,
  };
}

function mismoSemestre(a: Semestre, b: Semestre): boolean {
  return a.anio === b.anio && a.semestre === b.semestre;
}

function indiceSemestre(s: Semestre): number {
  return s.anio * 2 + (s.semestre - 1);
}

/**
 * Calcula, para cada semestre de la ventana, el presupuesto y el
 * gasto a partir de las FASES de cada proyecto, y guarda además el
 * desglose por proyecto (contribuciones) para el panel de detalle.
 *
 *  - Cada fase con coste y fecha de fin aporta su coste al semestre
 *    en el que cae esa fecha de fin (presupuesto).
 *  - El gastado total del proyecto (Actuals) se reparte entre sus
 *    fases proporcionalmente al peso (coste) de cada fase.
 */
export function calcularDatosPorSemestre(
  proyectos: Proyecto[],
  semestres: Semestre[],
): DatosSemestre[] {
  const resultado: DatosSemestre[] = semestres.map((semestre) => ({
    semestre,
    presupuesto: 0,
    gastado: 0,
    contribuciones: [],
  }));

  proyectos.forEach((proyecto) => {
    const fases = Object.values(proyecto.detallePorFase);
    const totalCostesFase = fases.reduce(
      (total, detalle) => total + (detalle?.coste ?? 0),
      0,
    );

    // Acumulado de este proyecto por cada semestre, para no crear
    // varias filas del mismo proyecto en el mismo semestre.
    const porSemestre = new Map<number, { presupuesto: number; gastado: number }>();

    fases.forEach((detalle) => {
      if (!detalle?.coste || !detalle.fechaFin) {
        return;
      }

      const semestreFase = semestreDeFecha(detalle.fechaFin);
      if (!semestreFase) {
        return;
      }

      const idx = indiceSemestre(semestreFase);
      const entradaResultado = resultado.find((item) =>
        mismoSemestre(item.semestre, semestreFase),
      );
      if (!entradaResultado) {
        return; // fuera de la ventana de 4 semestres
      }

      const peso = totalCostesFase > 0 ? detalle.coste / totalCostesFase : 0;
      const gastadoFase = proyecto.importeGastado * peso;

      entradaResultado.presupuesto += detalle.coste;
      entradaResultado.gastado += gastadoFase;

      const acumulado = porSemestre.get(idx) ?? { presupuesto: 0, gastado: 0 };
      acumulado.presupuesto += detalle.coste;
      acumulado.gastado += gastadoFase;
      porSemestre.set(idx, acumulado);
    });

    // Volcamos el acumulado del proyecto en las contribuciones de cada
    // semestre correspondiente.
    porSemestre.forEach((valores, idx) => {
      const entradaResultado = resultado.find(
        (item) => indiceSemestre(item.semestre) === idx,
      );
      if (entradaResultado) {
        entradaResultado.contribuciones.push({
          proyecto,
          presupuesto: valores.presupuesto,
          gastado: valores.gastado,
        });
      }
    });
  });

  // Ordenamos las contribuciones de cada semestre por presupuesto
  // descendente, para que el desglose se lea de mayor a menor.
  resultado.forEach((item) => {
    item.contribuciones.sort((a, b) => b.presupuesto - a.presupuesto);
  });

  return resultado;
}

/**
 * Suma del presupuesto (costes de fase) cuya fecha de fin cae fuera
 * de la ventana de semestres mostrada.
 */
export function presupuestoFueraDeVentana(
  proyectos: Proyecto[],
  semestres: Semestre[],
): number {
  const indices = semestres.map(indiceSemestre);
  const minimo = Math.min(...indices);
  const maximo = Math.max(...indices);

  let fuera = 0;

  proyectos.forEach((proyecto) => {
    Object.values(proyecto.detallePorFase).forEach((detalle) => {
      if (!detalle?.coste || !detalle.fechaFin) {
        return;
      }

      const s = semestreDeFecha(detalle.fechaFin);
      if (!s) {
        fuera += detalle.coste;
        return;
      }

      const idx = indiceSemestre(s);
      if (idx < minimo || idx > maximo) {
        fuera += detalle.coste;
      }
    });
  });

  return fuera;
}
