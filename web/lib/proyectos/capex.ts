import type { CategoriaProyecto, Proyecto } from "@/types/proyecto";

export interface Trimestre {
  anio: number;
  trimestre: 1 | 2 | 3 | 4;
}

export function etiquetaTrimestre(trimestre: Trimestre): string {
  return `T${trimestre.trimestre} ${trimestre.anio}`;
}

export function obtenerTrimestreDeFecha(fecha: Date): Trimestre {
  const mes = fecha.getMonth();
  const trimestre = (Math.floor(mes / 3) + 1) as 1 | 2 | 3 | 4;
  return { anio: fecha.getFullYear(), trimestre };
}

function indiceTrimestre(trimestre: Trimestre): number {
  return trimestre.anio * 4 + (trimestre.trimestre - 1);
}

function trimestreDesdeIndice(indice: number): Trimestre {
  const anio = Math.floor(indice / 4);
  const trimestre = ((indice % 4) + 1) as 1 | 2 | 3 | 4;
  return { anio, trimestre };
}

function trimestresIguales(a: Trimestre, b: Trimestre): boolean {
  return a.anio === b.anio && a.trimestre === b.trimestre;
}

export function generarTrimestres(
  cantidad: number,
  desde: Date = new Date(),
): Trimestre[] {
  const inicial = indiceTrimestre(obtenerTrimestreDeFecha(desde));
  const lista: Trimestre[] = [];

  for (let i = 0; i < cantidad; i += 1) {
    lista.push(trimestreDesdeIndice(inicial + i));
  }

  return lista;
}

function trimestresEntreFechas(fechaInicio: Date, fechaFin: Date): Trimestre[] {
  const indiceInicio = indiceTrimestre(obtenerTrimestreDeFecha(fechaInicio));
  const indiceFin = indiceTrimestre(obtenerTrimestreDeFecha(fechaFin));
  const lista: Trimestre[] = [];

  for (let i = indiceInicio; i <= indiceFin; i += 1) {
    lista.push(trimestreDesdeIndice(i));
  }

  return lista;
}

export interface DemandaTrimestre {
  trimestre: Trimestre;
  total: number;
}

export function calcularDemandaPorTrimestre(
  proyectos: Proyecto[],
  trimestres: Trimestre[],
): DemandaTrimestre[] {
  const totales: DemandaTrimestre[] = trimestres.map((trimestre) => ({
    trimestre,
    total: 0,
  }));

  proyectos.forEach((proyecto) => {
    Object.values(proyecto.detallePorFase).forEach((detalle) => {
      if (!detalle?.coste || !detalle.fechaInicio || !detalle.fechaFin) {
        return;
      }

      const inicio = new Date(`${detalle.fechaInicio}T00:00:00`);
      const fin = new Date(`${detalle.fechaFin}T00:00:00`);
      const trimestresFase = trimestresEntreFechas(inicio, fin);

      if (trimestresFase.length === 0) {
        return;
      }

      const costePorTrimestre = detalle.coste / trimestresFase.length;

      trimestresFase.forEach((trimestreFase) => {
        const entrada = totales.find((item) =>
          trimestresIguales(item.trimestre, trimestreFase),
        );
        if (entrada) {
          entrada.total += costePorTrimestre;
        }
      });
    });
  });

  return totales;
}

export function calcularDemandaAnual(proyectos: Proyecto[], anio: number): number {
  const trimestresDelAnio: Trimestre[] = [1, 2, 3, 4].map((trimestre) => ({
    anio,
    trimestre: trimestre as 1 | 2 | 3 | 4,
  }));

  const demanda = calcularDemandaPorTrimestre(proyectos, trimestresDelAnio);
  return demanda.reduce((total, item) => total + item.total, 0);
}

export type DemandaPorCategoria = Record<CategoriaProyecto, number>;

export interface DemandaTrimestreSegmentada {
  trimestre: Trimestre;
  porCategoria: DemandaPorCategoria;
  total: number;
}

/**
 * Igual que calcularDemandaPorTrimestre, pero desglosando el importe
 * de cada trimestre por categoría del proyecto (para el gráfico
 * apilado de la vista de Demanda CAPEX).
 */
export function calcularDemandaPorTrimestrePorCategoria(
  proyectos: Proyecto[],
  trimestres: Trimestre[],
): DemandaTrimestreSegmentada[] {
  const totales: DemandaTrimestreSegmentada[] = trimestres.map(
    (trimestre) => ({
      trimestre,
      porCategoria: {
        "Creación de valor": 0,
        "Protección de valor": 0,
        Obligatorio: 0,
      },
      total: 0,
    }),
  );

  proyectos.forEach((proyecto) => {
    Object.values(proyecto.detallePorFase).forEach((detalle) => {
      if (!detalle?.coste || !detalle.fechaInicio || !detalle.fechaFin) {
        return;
      }

      const inicio = new Date(`${detalle.fechaInicio}T00:00:00`);
      const fin = new Date(`${detalle.fechaFin}T00:00:00`);
      const trimestresFase = trimestresEntreFechas(inicio, fin);

      if (trimestresFase.length === 0) {
        return;
      }

      const costePorTrimestre = detalle.coste / trimestresFase.length;

      trimestresFase.forEach((trimestreFase) => {
        const entrada = totales.find((item) =>
          trimestresIguales(item.trimestre, trimestreFase),
        );
        if (entrada) {
          entrada.porCategoria[proyecto.categoria] += costePorTrimestre;
          entrada.total += costePorTrimestre;
        }
      });
    });
  });

  return totales;
}

export interface ContribucionProyecto {
  proyecto: Proyecto;
  monto: number;
}

export interface ContribucionesTrimestre {
  trimestre: Trimestre;
  contribuciones: ContribucionProyecto[];
}

/**
 * Para cada trimestre de la ventana indicada, calcula qué proyectos
 * contribuyen a la demanda de ese trimestre y cuánto aporta cada uno.
 * Se usa para mostrar el detalle en el tooltip de la barra.
 */
export function calcularContribucionesPorTrimestre(
  proyectos: Proyecto[],
  trimestres: Trimestre[],
): ContribucionesTrimestre[] {
  return trimestres.map((trimestre) => {
    const contribuciones: ContribucionProyecto[] = [];

    proyectos.forEach((proyecto) => {
      let montoProyecto = 0;

      Object.values(proyecto.detallePorFase).forEach((detalle) => {
        if (!detalle?.coste || !detalle.fechaInicio || !detalle.fechaFin) {
          return;
        }

        const inicio = new Date(`${detalle.fechaInicio}T00:00:00`);
        const fin = new Date(`${detalle.fechaFin}T00:00:00`);
        const trimestresFase = trimestresEntreFechas(inicio, fin);

        if (trimestresFase.length === 0) {
          return;
        }

        const perteneceAlTrimestre = trimestresFase.some((item) =>
          trimestresIguales(item, trimestre),
        );

        if (perteneceAlTrimestre) {
          montoProyecto += detalle.coste / trimestresFase.length;
        }
      });

      if (montoProyecto > 0) {
        contribuciones.push({ proyecto, monto: montoProyecto });
      }
    });

    contribuciones.sort((a, b) => b.monto - a.monto);

    return { trimestre, contribuciones };
  });
}
