import type {
  EstadoProyecto,
  FaseProyecto,
  Gate,
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
  if (proyecto.estado === "Finalizado" || proyecto.estado === "Cancelado") {
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
      (proyecto) => proyecto.estado === "En ejecución",
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

export function contarPorEstado(
  proyectos: Proyecto[],
): Array<{ etiqueta: EstadoProyecto; cantidad: number }> {
  const estados: EstadoProyecto[] = [
    "Propuesta",
    "En estudio",
    "Aprobado",
    "En ejecución",
    "En pausa",
    "Finalizado",
    "Cancelado",
  ];

  return estados.map((estado) => ({
    etiqueta: estado,
    cantidad: proyectos.filter((proyecto) => proyecto.estado === estado)
      .length,
  }));
}

export function contarPorFase(
  proyectos: Proyecto[],
): Array<{ etiqueta: FaseProyecto; cantidad: number }> {
  const fases: FaseProyecto[] = [
    "Fase 0 — Fase previa",
    "Fase I — Inicio / Project Charter",
    "Fase IIA — Análisis de escenarios",
    "Fase IIB — Ingeniería básica solución escogida",
    "Fase III — Ingeniería de detalle",
    "Fase IV — Ejecución",
    "Fase V — Cierre",
  ];

  return fases.map((fase) => ({
    etiqueta: fase,
    cantidad: proyectos.filter((proyecto) => proyecto.fase === fase).length,
  }));
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

export const ordenGates: Gate[] = ["G0", "G1", "G2", "G3", "G4", "G5", "G6"];

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

export function calcularProgresionGates(
  proyecto: Proyecto,
): Array<{ gate: Gate; estado: EstadoGate }> {
  const indiceActual = ordenGates.indexOf(proyecto.gateActual);

  return ordenGates.map((gate, indice) => {
    let estado: EstadoGate = "pendiente";

    if (indice < indiceActual) {
      estado = "superado";
    } else if (indice === indiceActual) {
      estado = "actual";
    }

    return { gate, estado };
  });
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
  if (proyecto.estado === "En pausa" || proyecto.estado === "Cancelado") {
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

  if (proyecto.estado === "Finalizado" || proyecto.estado === "Cancelado") {
    return false;
  }

  const fechaProximoGate = new Date(`${proyecto.fechaProximoGate}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return hoy.getTime() > fechaProximoGate.getTime();
}
