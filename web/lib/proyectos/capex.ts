import type { Proyecto } from "@/types/proyecto";

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

/**
 * Genera una lista de `cantidad` trimestres consecutivos a partir del
 * trimestre actual (o de la fecha indicada).
 */
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

/**
 * Lista de trimestres calendario comprendidos entre dos fechas
 * (ambos extremos inclusive).
 */
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

/**
 * Reparte linealmente el coste de cada fase (con fecha de inicio, fin
 * y coste definidos) entre los trimestres calendario que abarca, y
 * suma el resultado por proyecto para obtener la demanda total de
 * cada uno de los trimestres solicitados.
 */
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

/**
 * Suma la demanda de los 4 trimestres de un año concreto. Se usa para
 * la tarjeta "Demanda del ejercicio" del Overview.
 */
export function calcularDemandaAnual(proyectos: Proyecto[], anio: number): number {
  const trimestresDelAnio: Trimestre[] = [1, 2, 3, 4].map((trimestre) => ({
    anio,
    trimestre: trimestre as 1 | 2 | 3 | 4,
  }));

  const demanda = calcularDemandaPorTrimestre(proyectos, trimestresDelAnio);
  return demanda.reduce((total, item) => total + item.total, 0);
}
