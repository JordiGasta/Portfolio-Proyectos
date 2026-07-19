import type { Proyecto } from "@/types/proyecto";

function meses(...v: number[]): number[] {
  const m = [...v];
  while (m.length < 12) m.push(0);
  return m.slice(0, 12);
}

function fasesFase4(total: number) {
  const pesos = [0.04, 0.08, 0.1, 0.13, 0.15, 0.5, 0];
  const fines = [
    "2025-01-31", "2025-03-31", "2025-06-30", "2025-09-30",
    "2025-12-15", "2026-06-30", "",
  ];
  return construirFases(total, pesos, fines);
}

function fasesFase3(total: number) {
  const pesos = [0.05, 0.1, 0.15, 0.2, 0.5, 0, 0];
  const fines = [
    "2025-02-28", "2025-05-31", "2025-08-31", "2025-11-30",
    "2026-03-15", "", "",
  ];
  return construirFases(total, pesos, fines);
}

const NOMBRES_FASE = [
  "Fase 0 — Fase previa",
  "Fase I — Inicio / Project Charter",
  "Fase IIA — Análisis de escenarios",
  "Fase IIB — Ingeniería básica solución escogida",
  "Fase III — Ingeniería de detalle",
  "Fase IV — Ejecución",
  "Fase V — Cierre",
] as const;

function construirFases(
  total: number,
  pesos: number[],
  fines: string[],
): Proyecto["detallePorFase"] {
  if (total <= 0) return {};
  const costes = pesos.map((p) => Math.round(total * p));
  const idxUlt = costes.reduce((ult, c, i) => (c > 0 ? i : ult), 0);
  costes[idxUlt] += total - costes.reduce((t, c) => t + c, 0);

  const detalle: Proyecto["detallePorFase"] = {};
  NOMBRES_FASE.forEach((nombre, i) => {
    if (costes[i] > 0 || fines[i]) {
      detalle[nombre] = {
        coste: costes[i],
        fechaFin: fines[i] || undefined,
      };
    }
  });
  return detalle;
}

/**
 * presupuesto = "Total Project Approved" (columna E). Si un proyecto
 * no tenía aprobación previa (E = 0), es un proyecto nuevo de 2026 y
 * su presupuesto es la columna "Carryover 2025 + New Projects 2026"
 * (F) al completo.
 *
 * gastado = "Total Consumido proyecto capex" (columna U): gasto real
 * acumulado (2025 + 2026 a fecha de hoy).
 *
 * El histórico por fase (detallePorFase) reparte el PRESUPUESTO entre
 * fases según su peso; el gasto de cada semestre se calcula aplicando
 * ese mismo peso al gastado real, para que quede proporcional al
 * presupuesto de cada fase.
 */
function base(
  id: string,
  codigo: string,
  nombre: string,
  categoriaExcel: string,
  anio: number,
  presupuesto: number,
  gastadoTotal: number,
  gastoMensual2026: number[],
  faseCuatro: boolean,
  bucket: Proyecto["objetivoEstrategico"],
  gate: Proyecto["gateActual"],
): Proyecto {
  const categoria: Proyecto["categoria"] =
    /compliance|legal|environment|port|safety/i.test(categoriaExcel)
      ? "Obligatorio"
      : /growth|new/i.test(categoriaExcel)
        ? "Creación de valor"
        : "Protección de valor";

  const presupuestoRedondeado = Math.round(presupuesto);
  const gastado = Math.round(gastadoTotal);

  return {
    id,
    codigo,
    nombre,
    descripcion: nombre,
    responsable: "Por asignar",
    departamento: "Mantenimiento",
    tipo: "CAPEX",
    fase: faseCuatro
      ? "Fase IV — Ejecución"
      : "Fase III — Ingeniería de detalle",
    rigurosidad: "R2",
    presupuestoAprobado: presupuestoRedondeado,
    // No disponible en el Excel de origen: se deja en 0 en vez de
    // inventar un valor, hasta que haya un dato real.
    importeComprometido: 0,
    importeGastado: gastado,
    fechaInicio: `${anio}-01-15`,
    fechaFinPrevista: "2026-12-15",
    avance:
      presupuestoRedondeado > 0
        ? Math.min(100, Math.round((gastado / presupuestoRedondeado) * 100))
        : 0,
    prioridad: "Media",
    observaciones: "",
    categoria,
    estado: "En curso",
    objetivoEstrategico: bucket,
    propietario: "Jordi Gasta",
    sponsor: "Dirección de Planta",
    gateActual: gate,
    gateStatus: faseCuatro ? [2, 2, 2, 2, 2, 1, 0] : [2, 2, 2, 1, 0, 0, 0],
    fechaProximoGate: faseCuatro ? "2026-11-30" : "2026-09-30",
    fechaUltimoGate: "2026-03-15",
    etc: Math.max(0, presupuestoRedondeado - gastado),
    numeroJobBC: `BC-${codigo}`,
    exposicionRiesgo:
      categoria === "Obligatorio" ? Math.round(presupuestoRedondeado * 0.5) : undefined,
    beneficioEsperado:
      categoria === "Creación de valor" ? Math.round(presupuestoRedondeado * 0.3) : undefined,
    nivelRiesgo: "Medio",
    horizonteTemporal: "Corto plazo",
    // OJO: se reparte el PRESUPUESTO por fase, no el gastado.
    detallePorFase: faseCuatro
      ? fasesFase4(presupuestoRedondeado)
      : fasesFase3(presupuestoRedondeado),
    gastoMensual2026: gastoMensual2026.map((v) => Math.round(v)),
    carryover2025: 0,
  };
}

export const proyectos: Proyecto[] = [
  base("1", "P009", "Buhler crane up to date", "Maintenance", 2024, 450000, 501505.21,
    meses(98009.89, 12359.1, 16809.49, 216, 10028.58, 14630.54, 0, 0, 0, 0, 0, 0),
    true, "Fiabilidad operativa", "G3"),
  base("2", "P010", "Fire Protection installation", "Compliance Insurance", 2024, 1200000, 538263,
    meses(3057.28, 48134.18, 46598.32, 161252.15, 27981.39, 37131.09, 0, 0, 0, 0, 0, 0),
    true, "Cumplimiento normativo", "G3"),
  base("3", "P012", "Improvement ventilation area of transformers", "Maintenance", 2024, 75000, 0,
    meses(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    false, "Fiabilidad operativa", "G2B"),
  base("4", "P015", "Extraction area containment", "Compliance Port", 2024, 250000, 256334.48,
    meses(12241.76, 68977.89, 48268.76, 436, 19690.73, 1706.87, 0, 0, 0, 0, 0, 0),
    true, "Cumplimiento normativo", "G3"),
  base("5", "P018", "Slide gates 501", "Compliance Environment", 2025, 150000, 140850.69,
    meses(17653.46, 1962.08, 49850, 28888.85, 231.94, 13250.44, 0, 0, 0, 0, 0, 0),
    true, "Cumplimiento normativo", "G3"),
  base("6", "P022", "Silo 3 Repair", "Maintenance", 2025, 1600000, 754072.99,
    meses(90539.75, 171304.65, 3085, 349098.75, 3280, 111370.2, 0, 0, 0, 0, 0, 0),
    true, "Fiabilidad operativa", "G3"),
  base("7", "P025", "Calentador de Hexano 930", "Maintenance", 2025, 135000, 122904.08,
    meses(10263, 2546.21, 24896.86, 0, 978.78, 6885.17, 0, 0, 0, 0, 0, 0),
    true, "Fiabilidad operativa", "G3"),
  base("8", "P029", "Replacement VFD boiler's Fan", "Maintenance", 2025, 70000, 55242.21,
    meses(15696.51, 15949.91, 0, 390.64, 1797.08, 0, 0, 0, 0, 0, 0, 0),
    true, "Fiabilidad operativa", "G3"),
  base("9", "P030", "Extraction control room", "Legal Compliance", 2025, 100000, 93393.41,
    meses(430.03, 5516.8, 0, 6397.45, 6178.1, 4884.72, 0, 0, 0, 0, 0, 0),
    true, "Cumplimiento normativo", "G3"),
  base("10", "P034", "WESTFALIA pump bol reparation", "Maintenance", 2026, 65000, 0,
    meses(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    true, "Fiabilidad operativa", "G3"),
  base("11", "P035", "Rotary dryer isolation", "Maintenance", 2026, 40000, 41025.13,
    meses(0, 41025.13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    true, "Fiabilidad operativa", "G3"),
  base("12", "P036", "Dust collection from Torit Filters", "Environmental", 2026, 105000, 0,
    meses(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    true, "Cumplimiento normativo", "G3"),
  base("13", "P037", "Flakers roll replacement", "Maintenance", 2026, 86147.32, 0,
    meses(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    true, "Fiabilidad operativa", "G3"),
];
