import type {
  EstadoProyecto,
  FaseProyecto,
  Gate,
  ObjetivoEstrategico,
  CategoriaProyecto,
  Proyecto,
} from "@/types/proyecto";

export interface ResumenPortfolio {
  totalProyectos: number;
  proyectosEnEjecucion: number;
  proyectosRetrasados: number;
  presupuestoTotal: number;
  importeComprometidoTotal: number;
  importeGastadoTotal: number;
}

export function estaRetrasado(proyecto: Proyecto): boolean {
  if (
    proyecto.estado === "Cancelado" ||
    proyecto.estado === "Terminado" ||
    proyecto.fase === "Fase V — Cierre"
  ) {
    return false;
  }

  const fechaFin = new Date(`${proyecto.fechaFinPrevista}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return fechaFin.getTime() < hoy.getTime();
}

export function calcularResumen(proyectos: Proyecto[]): ResumenPortfolio {
  return {
    totalProyectos: proyectos.length,
    proyectosEnEjecucion: proyectos.filter(
      (proyecto) => proyecto.fase === "Fase IV — Ejecución",
    ).length,
    proyectosRetrasados: proyectos.filter(estaRetrasado).length,
    presupuestoTotal: proyectos.reduce(
      (total, proyecto) => total + proyecto.presupuestoAprobado,
      0,
    ),
    importeComprometidoTotal: proyectos.reduce(
      (total, proyecto) => total + proyecto.importeComprometido,
      0,
    ),
    importeGastadoTotal: proyectos.reduce(
      (total, proyecto) => total + proyecto.importeGastado,
      0,
    ),
  };
}

export const ordenFases: FaseProyecto[] = [
  "Fase 0 — Fase previa",
  "Fase I — Inicio / Project Charter",
  "Fase IIA — Análisis de escenarios",
  "Fase IIB — Ingeniería básica solución escogida",
  "Fase III — Ingeniería de detalle",
  "Fase IV — Ejecución",
  "Fase V — Cierre",
];

export function contarPorFase(
  proyectos: Proyecto[],
): Array<{ etiqueta: FaseProyecto; cantidad: number }> {
  return ordenFases.map((fase) => ({
    etiqueta: fase,
    cantidad: proyectos.filter((proyecto) => proyecto.fase === fase).length,
  }));
}

/** 7 gates, en orden, según el documento de base de datos. */
export const ordenGates: Gate[] = ["G0", "G1", "G2A", "G2B", "G3", "G4", "G5"];

export function calcularEAC(proyecto: Proyecto): number {
  return proyecto.importeGastado + proyecto.etc;
}

export function calcularVariacionPorcentual(proyecto: Proyecto): number {
  if (proyecto.presupuestoAprobado === 0) {
    return 0;
  }

  const eac = calcularEAC(proyecto);
  return Math.round(
    ((proyecto.presupuestoAprobado - eac) / proyecto.presupuestoAprobado) *
      100,
  );
}

export function tieneSobrecoste(proyecto: Proyecto): boolean {
  return calcularEAC(proyecto) > proyecto.presupuestoAprobado * 1.1;
}

export type EstadoGate = "superado" | "actual" | "pendiente";

/**
 * Calcula la progresión de los 7 gates a partir del array
 * gateStatus almacenado (0=pendiente, 1=actual, 2=superado).
 */
export function calcularProgresionGates(
  proyecto: Proyecto,
): Array<{ gate: Gate; estado: EstadoGate }> {
  return ordenGates.map((gate, indice) => {
    const valor = proyecto.gateStatus[indice] ?? 0;
    const estado: EstadoGate =
      valor === 2 ? "superado" : valor === 1 ? "actual" : "pendiente";
    return { gate, estado };
  });
}

/**
 * Genera el array gateStatus correspondiente a un gate actual dado,
 * marcando como superados todos los anteriores y como actual el
 * indicado. Se usa al guardar el formulario de proyecto, para
 * mantener gateActual y gateStatus siempre coherentes entre sí.
 */
export function derivarGateStatusDesdeGateActual(gateActual: Gate): number[] {
  const indice = ordenGates.indexOf(gateActual);
  return ordenGates.map((_, i) => (i < indice ? 2 : i === indice ? 1 : 0));
}

export function obtenerProximoGate(proyecto: Proyecto): Gate | null {
  const indiceActual = ordenGates.indexOf(proyecto.gateActual);

  if (indiceActual === -1 || indiceActual >= ordenGates.length - 1) {
    return null;
  }

  return ordenGates[indiceActual + 1];
}

export function calcularDiasDesdeUltimoGate(proyecto: Proyecto): number | null {
  if (!proyecto.fechaUltimoGate) {
    return null;
  }

  const fechaUltimoGate = new Date(`${proyecto.fechaUltimoGate}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const milisegundosPorDia = 1000 * 60 * 60 * 24;
  return Math.round(
    (hoy.getTime() - fechaUltimoGate.getTime()) / milisegundosPorDia,
  );
}

export function esProyectoZombie(proyecto: Proyecto): boolean {
  if (
    proyecto.estado === "En pausa" ||
    proyecto.estado === "Cancelado" ||
    proyecto.estado === "Terminado"
  ) {
    return false;
  }

  const indiceFase = ordenFases.indexOf(proyecto.fase);
  const esFaseActiva = indiceFase >= 0 && indiceFase <= 5;

  if (!esFaseActiva) {
    return false;
  }

  const dias = calcularDiasDesdeUltimoGate(proyecto);
  return dias !== null && dias > 90;
}

export function tieneGateVencido(proyecto: Proyecto): boolean {
  if (!proyecto.fechaProximoGate) {
    return false;
  }

  if (
    proyecto.estado === "Cancelado" ||
    proyecto.estado === "Terminado" ||
    proyecto.fase === "Fase V — Cierre"
  ) {
    return false;
  }

  const fechaProximoGate = new Date(`${proyecto.fechaProximoGate}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return hoy.getTime() > fechaProximoGate.getTime();
}

/**
 * Un proyecto se considera "activo" (parte del portfolio en curso a
 * efectos de presupuesto y gasto) mientras su estado no sea
 * "Terminado". Se usa el estado en lugar de la fase, porque el gate
 * final de un cierre depende de la rigurosidad (R1 cierra en Fase IV,
 * R2/R3 en Fase V).
 */
export function esProyectoActivo(proyecto: Proyecto): boolean {
  return proyecto.estado !== "Terminado";
}

export function proyectosActivos(proyectos: Proyecto[]): Proyecto[] {
  return proyectos.filter(esProyectoActivo);
}

export const ordenCategorias: CategoriaProyecto[] = [
  "Creación de valor",
  "Protección de valor",
  "Obligatorio",
];

export function contarActivosPorCategoria(
  proyectos: Proyecto[],
): Array<{ categoria: CategoriaProyecto; cantidad: number }> {
  const activos = proyectosActivos(proyectos);

  return ordenCategorias.map((categoria) => ({
    categoria,
    cantidad: activos.filter((proyecto) => proyecto.categoria === categoria)
      .length,
  }));
}

export function sumarPresupuestoActivos(proyectos: Proyecto[]): number {
  return proyectosActivos(proyectos).reduce(
    (total, proyecto) => total + proyecto.presupuestoAprobado,
    0,
  );
}

export function sumarGastadoActivos(proyectos: Proyecto[]): number {
  return proyectosActivos(proyectos).reduce(
    (total, proyecto) => total + proyecto.importeGastado,
    0,
  );
}

export function contarSobrecostes(proyectos: Proyecto[]): number {
  return proyectos.filter(tieneSobrecoste).length;
}

/** Los 3 valores de salud "activa" (sin pausa/cancelado/terminado), para el Health breakdown. */
export const ordenSalud: EstadoProyecto[] = [
  "En curso",
  "En riesgo",
  "Fuera de control",
];

/** Los 6 valores completos del campo estado, para filtros y formularios. */
export const ordenEstadosProyecto: EstadoProyecto[] = [
  "En curso",
  "En riesgo",
  "Fuera de control",
  "En pausa",
  "Cancelado",
  "Terminado",
];

export function contarPorSalud(
  proyectos: Proyecto[],
): Array<{ estadoSalud: EstadoProyecto; cantidad: number }> {
  const elegibles = proyectos.filter(
    (proyecto) =>
      proyecto.estado !== "En pausa" &&
      proyecto.estado !== "Cancelado" &&
      proyecto.estado !== "Terminado",
  );

  return ordenSalud.map((estadoSalud) => ({
    estadoSalud,
    cantidad: elegibles.filter((proyecto) => proyecto.estado === estadoSalud)
      .length,
  }));
}

export const ordenObjetivosEstrategicos: ObjetivoEstrategico[] = [
  "Fiabilidad operativa",
  "Energía y coste",
  "Calidad y seguridad alimentaria",
  "Backbone digital",
  "Cumplimiento normativo",
];
