import type { FaseProyecto, Proyecto } from "@/types/proyecto";
import { ordenFases } from "@/lib/proyectos/calculos";

export interface PosicionBarra {
  /** Posición de inicio, en unidades de mes (puede tener decimales según el día). */
  inicio: number;
  /** Ancho, en unidades de mes (puede tener decimales). */
  ancho: number;
}

const NOMBRES_MES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/** Genera los 12 meses (índice 0-11) del año indicado, con su etiqueta corta. */
export function generarMeses(anio: number): { anio: number; mes: number; etiqueta: string }[] {
  return NOMBRES_MES.map((nombre, mes) => ({
    anio,
    mes,
    etiqueta: `${nombre} ${anio}`,
  }));
}

function diasEnMes(anio: number, mesIndice0: number): number {
  return new Date(anio, mesIndice0 + 1, 0).getDate();
}

/**
 * Convierte una fecha a una posición continua en "unidades de mes"
 * relativa al 1 de enero del año indicado (unidad 0). El día dentro
 * del mes se traduce a una fracción, para poder distinguir dos
 * fechas del mismo mes (p. ej. día 21 y día 22).
 */
function fechaAUnidadMes(fecha: Date, anioBase: number): number {
  const mesesDesdeBase = (fecha.getFullYear() - anioBase) * 12 + fecha.getMonth();
  const dias = diasEnMes(fecha.getFullYear(), fecha.getMonth());
  const fraccionDia = (fecha.getDate() - 1) / dias;
  return mesesDesdeBase + fraccionDia;
}

/**
 * Calcula la posición (en unidades de mes, con decimales) de un
 * tramo que va de fechaInicio a fechaFin, recortado al año indicado.
 * La fecha de fin se considera inclusiva (se añade un día de ancho),
 * para que un tramo que termina el día 21 y otro que empieza el 22
 * del mismo mes queden justo seguidos, sin solaparse ni dejar hueco.
 */
export function calcularPosicionBarraMensual(
  fechaInicioIso: string,
  fechaFinIso: string,
  anio: number,
): PosicionBarra | null {
  const inicio = new Date(`${fechaInicioIso}T00:00:00`);
  const fin = new Date(`${fechaFinIso}T00:00:00`);

  const unidadInicio = fechaAUnidadMes(inicio, anio);
  const diasFin = diasEnMes(fin.getFullYear(), fin.getMonth());
  const unidadFin = fechaAUnidadMes(fin, anio) + 1 / diasFin; // inclusivo

  if (unidadFin <= 0 || unidadInicio >= 12) {
    return null;
  }

  const inicioRecortado = Math.max(unidadInicio, 0);
  const finRecortado = Math.min(unidadFin, 12);

  return {
    inicio: inicioRecortado,
    ancho: Math.max(0, finRecortado - inicioRecortado),
  };
}

/**
 * Calcula la posición (en unidades de mes, fraccionaria) del día de
 * hoy dentro del año mostrado, para la línea de "hoy". Devuelve null
 * si hoy no cae dentro del año seleccionado.
 */
export function calcularPosicionHoyMensual(anio: number): number | null {
  const hoy = new Date();
  if (hoy.getFullYear() !== anio) {
    return null;
  }
  return fechaAUnidadMes(hoy, anio);
}

export interface TramoFase {
  fase: FaseProyecto;
  posicion: PosicionBarra;
}

/**
 * Calcula, para un proyecto y un año concreto, el tramo de cada fase
 * que tenga fecha de fin registrada. Como la mayoría de proyectos
 * solo tienen la fecha de FIN de cada fase (no la de inicio), se
 * encadenan: el inicio de una fase es el fin de la fase anterior (o
 * la fecha de inicio del proyecto, para la primera fase con datos).
 * Al usar posiciones fraccionarias por día, dos fases consecutivas
 * dentro del mismo mes quedan justo seguidas, sin solaparse.
 */
export function calcularTramosPorFase(
  proyecto: Proyecto,
  anio: number,
): TramoFase[] {
  const tramos: TramoFase[] = [];
  let inicioTramoActual = proyecto.fechaInicio;

  ordenFases.forEach((fase) => {
    const detalle = proyecto.detallePorFase[fase];
    if (!detalle?.fechaFin) {
      return;
    }

    const posicion = calcularPosicionBarraMensual(
      inicioTramoActual,
      detalle.fechaFin,
      anio,
    );

    if (posicion) {
      tramos.push({ fase, posicion });
    }

    inicioTramoActual = detalle.fechaFin;
  });

  return tramos;
}
