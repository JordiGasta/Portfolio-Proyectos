export type EstadoProyecto =
  | "Propuesta"
  | "En estudio"
  | "Aprobado"
  | "En ejecución"
  | "En pausa"
  | "Finalizado"
  | "Cancelado";

export type FaseProyecto =
  | "Fase 0 — Fase previa"
  | "Fase I — Inicio / Project Charter"
  | "Fase IIA — Análisis de escenarios"
  | "Fase IIB — Ingeniería básica solución escogida"
  | "Fase III — Ingeniería de detalle"
  | "Fase IV — Ejecución"
  | "Fase V — Cierre";

export type Rigurosidad = "R1" | "R2" | "R3";

export type Prioridad = "Alta" | "Media" | "Baja";

export type TipoProyecto =
  | "CAPEX"
  | "OPEX"
  | "Mejora continua"
  | "Mantenimiento"
  | "Normativo";

export type Departamento =
  | "Producción"
  | "Mantenimiento"
  | "Ingeniería"
  | "Calidad"
  | "Logística"
  | "Medio Ambiente"
  | "Dirección";

export type CategoriaProyecto =
  | "Creación de valor"
  | "Protección de valor"
  | "Obligatorio";

export type EstadoSalud = "En curso" | "En riesgo" | "Fuera de control";

export type Gate = "G0" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6";

export interface DetalleFase {
  coste?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface Proyecto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  responsable: string;
  departamento: Departamento;
  tipo: TipoProyecto;
  estado: EstadoProyecto;
  fase: FaseProyecto;
  rigurosidad: Rigurosidad;
  presupuestoAprobado: number;
  importeComprometido: number;
  importeGastado: number;
  fechaInicio: string;
  fechaFinPrevista: string;
  avance: number;
  prioridad: Prioridad;
  observaciones: string;
  categoria: CategoriaProyecto;
  estadoSalud: EstadoSalud;
  propietario: string;
  sponsor: string;
  gateActual: Gate;
  fechaProximoGate?: string;
  fechaUltimoGate?: string;
  etc: number;
  numeroJobBC: string | null;
  exposicionRiesgo?: number;
  beneficioEsperado?: number;
  detallePorFase: Partial<Record<FaseProyecto, DetalleFase>>;
}
