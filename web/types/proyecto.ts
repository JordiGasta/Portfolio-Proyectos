export type FaseProyecto =
  | "Fase 0 — Fase previa"
  | "Fase I — Inicio / Project Charter"
  | "Fase IIA — Análisis de escenarios"
  | "Fase IIB — Ingeniería básica solución escogida"
  | "Fase III — Ingeniería de detalle"
  | "Fase IV — Ejecución"
  | "Fase V — Cierre"
  | "N/A";

export type Rigurosidad = "R1" | "R2" | "R3" | "N/A";

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

export type EstadoProyecto =
  | "En curso"
  | "En riesgo"
  | "Fuera de control"
  | "En pausa"
  | "En estudio"
  | "Cancelado"
  | "Terminado";

export type ObjetivoEstrategico =
  | "Fiabilidad operativa"
  | "Energía y coste"
  | "Calidad y seguridad alimentaria"
  | "Backbone digital"
  | "Cumplimiento normativo";

export type Gate = "G0" | "G1" | "G2A" | "G2B" | "G3" | "G4" | "G5";

export type NivelRiesgo = "Bajo" | "Medio" | "Alto";

export type HorizonteTemporal = "Corto plazo" | "Medio plazo" | "Largo plazo";

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
  estado: EstadoProyecto;
  objetivoEstrategico: ObjetivoEstrategico;
  propietario: string;
  sponsor: string;
  gateActual: Gate;
  gateStatus: number[];
  fechaProximoGate?: string;
  fechaUltimoGate?: string;
  etc: number;
  numeroJobBC: string | null;
  exposicionRiesgo?: number;
  beneficioEsperado?: number;
  motivoCancelacion?: string;
  nivelRiesgo: NivelRiesgo;
  horizonteTemporal: HorizonteTemporal;
  detallePorFase: Partial<Record<FaseProyecto, DetalleFase>>;
  /** Gasto real mes a mes de 2026 (12 valores: enero..diciembre). */
  gastoMensual2026: number[];
  /** Presupuesto de carryover (columna 'Carryover 2025' de SharePoint / 'Carryover 2025 + New Projects 2026' del Excel original). */
  carryover2025: number;
  /** Centro de coste en Business Central, para consultar sus movimientos reales. */
  costCenter?: string;
}
