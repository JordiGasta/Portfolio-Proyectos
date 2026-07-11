import type { Proyecto } from "@/types/proyecto";

function meses(...v: number[]): number[] {
  const m = [...v];
  while (m.length < 12) m.push(0);
  return m.slice(0, 12);
}

// Reparto de coste por fase (mismos pesos que la plantilla Excel) y
// fechas de fin de cada fase, para tener histórico real por fases.
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
  const costes = pesos.map((p) => Math.round(total * p));
  // Ajuste para que la suma cuadre exactamente con el total.
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

function base(
  id: string,
  codigo: string,
  nombre: string,
  categoriaExcel: string,
  anio: number,
  presupuesto: number,
  gasto: number[],
  faseCuatro: boolean,
  bucket: Proyecto["objetivoEstrategico"],
  gate: Proyecto["gateActual"],
): Proyecto {
  const gastado = gasto.reduce((t, v) => t + v, 0);
  const categoria: Proyecto["categoria"] =
    /compliance|legal|environment|port|safety/i.test(categoriaExcel)
      ? "Obligatorio"
      : /growth|new/i.test(categoriaExcel)
        ? "Creación de valor"
        : "Protección de valor";

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
    presupuestoAprobado: presupuesto,
    importeComprometido: Math.round(presupuesto * 0.9),
    importeGastado: gastado,
    fechaInicio: `${anio}-01-15`,
    fechaFinPrevista: "2026-12-15",
    avance:
      presupuesto > 0 ? Math.min(100, Math.round((gastado / presupuesto) * 100)) : 0,
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
    etc: Math.max(0, presupuesto - gastado),
    numeroJobBC: `BC-${codigo}`,
    exposicionRiesgo:
      categoria === "Obligatorio" ? Math.round(presupuesto * 0.5) : undefined,
    beneficioEsperado:
      categoria === "Creación de valor" ? Math.round(presupuesto * 0.3) : undefined,
    nivelRiesgo: "Medio",
    horizonteTemporal: "Corto plazo",
    detallePorFase: faseCuatro
      ? fasesFase4(gastado)
      : fasesFase3(gastado),
    gastoMensual2026: gasto,
  };
}

export const proyectos: Proyecto[] = [
  base("1", "P009", "Buhler crane up to date", "Maintenance", 2024, 120000,
    meses(8000, 9000, 10000, 12000, 11000, 9000, 7000, 6000, 5000, 4000, 0, 0),
    true, "Fiabilidad operativa", "G3"),
  base("2", "P010", "Fire Protection installation", "Compliance Insurance", 2024, 250000,
    meses(15000, 18000, 20000, 22000, 20000, 18000, 16000, 14000, 12000, 10000, 8000, 6000),
    true, "Cumplimiento normativo", "G3"),
  base("3", "P012", "Improvement ventilation area of transformers", "Maintenance", 2024, 95000,
    meses(4000, 5000, 6000, 7000, 6000, 5000, 4000, 3000, 2000, 0, 0, 0),
    false, "Fiabilidad operativa", "G2B"),
  base("4", "P015", "Extraction area containment", "Compliance Port", 2024, 180000,
    meses(10000, 12000, 14000, 15000, 14000, 12000, 10000, 9000, 8000, 7000, 6000, 0),
    true, "Cumplimiento normativo", "G3"),
  base("5", "P018", "Slide gates 501", "Compliance Environment", 2025, 140000,
    meses(6000, 8000, 10000, 11000, 10000, 9000, 8000, 7000, 6000, 5000, 4000, 0),
    true, "Cumplimiento normativo", "G3"),
  base("6", "P022", "Silo 3 Repair", "Maintenance", 2025, 210000,
    meses(12000, 15000, 18000, 20000, 18000, 16000, 14000, 12000, 10000, 8000, 6000, 4000),
    true, "Fiabilidad operativa", "G3"),
  base("7", "P025", "Calentador de Hexano 930", "Maintenance", 2025, 88000,
    meses(4000, 5000, 6000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 0, 0),
    true, "Fiabilidad operativa", "G3"),
  base("8", "P029", "Replacement VFD boiler's Fan", "Maintenance", 2025, 65000,
    meses(3000, 4000, 5000, 6000, 5000, 4000, 3000, 2000, 1000, 0, 0, 0),
    true, "Fiabilidad operativa", "G3"),
  base("9", "P030", "Extraction control room", "Legal Compliance", 2025, 175000,
    meses(9000, 11000, 13000, 15000, 14000, 12000, 11000, 10000, 9000, 8000, 7000, 6000),
    true, "Cumplimiento normativo", "G3"),
  base("10", "P034", "WESTFALIA pump bol reparation", "Maintenance", 2026, 72000,
    meses(0, 0, 5000, 7000, 8000, 8000, 7000, 6000, 5000, 4000, 3000, 2000),
    true, "Fiabilidad operativa", "G3"),
  base("11", "P035", "Rotary dryer isolation", "Maintenance", 2026, 98000,
    meses(0, 0, 6000, 8000, 10000, 10000, 9000, 8000, 7000, 6000, 5000, 4000),
    true, "Fiabilidad operativa", "G3"),
  base("12", "P036", "Dust collection from Torit Filters", "Environmental", 2026, 156000,
    meses(0, 0, 0, 10000, 14000, 15000, 14000, 13000, 12000, 11000, 10000, 9000),
    true, "Cumplimiento normativo", "G3"),
  base("13", "P037", "Flakers roll replacement", "Maintenance", 2026, 54000,
    meses(0, 0, 0, 5000, 6000, 7000, 6000, 5000, 4000, 3000, 2000, 0),
    true, "Fiabilidad operativa", "G3"),
];
