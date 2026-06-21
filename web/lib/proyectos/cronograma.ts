import type { Trimestre } from "@/lib/proyectos/capex";
import { obtenerTrimestreDeFecha } from "@/lib/proyectos/capex";

function indiceTrimestre(trimestre: Trimestre): number {
  return trimestre.anio * 4 + (trimestre.trimestre - 1);
}

export interface PosicionBarra {
  inicio: number;
  ancho: number;
}

/**
 * Calcula en qué columnas (0 a 7) de la ventana de trimestres debe
 * dibujarse una barra que va de fechaInicio a fechaFin. Si el rango no
 * solapa con la ventana visible, devuelve null.
 */
export function calcularPosicionBarra(
  fechaInicioIso: string,
  fechaFinIso: string,
  trimestres: Trimestre[],
): PosicionBarra | null {
  const inicio = new Date(`${fechaInicioIso}T00:00:00`);
  const fin = new Date(`${fechaFinIso}T00:00:00`);

  const indiceInicio = indiceTrimestre(obtenerTrimestreDeFecha(inicio));
  const indiceFin = indiceTrimestre(obtenerTrimestreDeFecha(fin));

  const indiceVentanaInicio = indiceTrimestre(trimestres[0]);
  const indiceVentanaFin = indiceTrimestre(trimestres[trimestres.length - 1]);

  if (indiceFin < indiceVentanaInicio || indiceInicio > indiceVentanaFin) {
    return null;
  }

  const inicioRecortado = Math.max(indiceInicio, indiceVentanaInicio);
  const finRecortado = Math.min(indiceFin, indiceVentanaFin);

  return {
    inicio: inicioRecortado - indiceVentanaInicio,
    ancho: finRecortado - inicioRecortado + 1,
  };
}

/**
 * Calcula la posición (en unidades de columna, puede ser fraccionaria)
 * del día de hoy dentro de la ventana de trimestres, para dibujar la
 * línea vertical de "hoy".
 */
export function calcularPosicionHoy(trimestres: Trimestre[]): number {
  const hoy = new Date();
  const trimestreHoy = obtenerTrimestreDeFecha(hoy);
  const indiceHoy = indiceTrimestre(trimestreHoy);
  const indiceVentanaInicio = indiceTrimestre(trimestres[0]);
  const columna = indiceHoy - indiceVentanaInicio;

  const mesInicioTrimestre = (trimestreHoy.trimestre - 1) * 3;
  const inicioTrimestre = new Date(hoy.getFullYear(), mesInicioTrimestre, 1);
  const finTrimestre = new Date(hoy.getFullYear(), mesInicioTrimestre + 3, 0);

  const diasTotales =
    (finTrimestre.getTime() - inicioTrimestre.getTime()) / 86400000 + 1;
  const diasTranscurridos =
    (hoy.getTime() - inicioTrimestre.getTime()) / 86400000;

  const fraccion = diasTotales > 0 ? diasTranscurridos / diasTotales : 0;

  return columna + fraccion;
}
