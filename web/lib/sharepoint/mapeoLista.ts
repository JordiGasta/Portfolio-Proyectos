import type { Proyecto, FaseProyecto } from "@/types/proyecto";
import { derivarGateStatusDesdeGateActual } from "@/lib/proyectos/calculos";

const ORDEN_FASES: FaseProyecto[] = [
  "Fase 0 — Fase previa",
  "Fase I — Inicio / Project Charter",
  "Fase IIA — Análisis de escenarios",
  "Fase IIB — Ingeniería básica solución escogida",
  "Fase III — Ingeniería de detalle",
  "Fase IV — Ejecución",
  "Fase V — Cierre",
];

/**
 * Nombres INTERNOS reales de las columnas de la lista de SharePoint
 * (obtenidos vía /api/sharepoint/columnas), no los nombres visibles.
 *
 * Confirmado: "CosteFaseI" es la columna renombrada a "Coste Fase 0",
 * y "CosteFaseI0" es "Coste Fase I" (nombres internos heredados de
 * un error de tecleo original, ya resuelto a nivel de nombre visible).
 */
const CAMPO_COSTE_FASE: Record<FaseProyecto, string> = {
  "Fase 0 — Fase previa": "CosteFaseI",
  "Fase I — Inicio / Project Charter": "CosteFaseI0",
  "Fase IIA — Análisis de escenarios": "CosteFaseIIA",
  "Fase IIB — Ingeniería básica solución escogida": "CosteFaseIIB",
  "Fase III — Ingeniería de detalle": "CosteFaseIII",
  "Fase IV — Ejecución": "CosteFaseIV",
  "Fase V — Cierre": "CosteFaseV",
  "N/A": "",
};

const CAMPO_INICIO_FASE: Partial<Record<FaseProyecto, string>> = {
  "Fase 0 — Fase previa": "InicioFase0",
  "Fase I — Inicio / Project Charter": "InicioFaseI",
  "Fase IIA — Análisis de escenarios": "InicioFaseIIA",
  "Fase IIB — Ingeniería básica solución escogida": "InicioFaseIIB",
  "Fase III — Ingeniería de detalle": "InicioFaseIII",
  "Fase IV — Ejecución": "InicioFaseIV",
  // Fase V no tiene fecha de inicio propia (empieza al terminar la IV).
};

const CAMPO_FIN_FASE: Partial<Record<FaseProyecto, string>> = {
  "Fase 0 — Fase previa": "FinFase0",
  "Fase I — Inicio / Project Charter": "FinFaseI",
  "Fase IIA — Análisis de escenarios": "FinFaseIIA",
  "Fase IIB — Ingeniería básica solución escogida": "FinFaseIIB",
  "Fase III — Ingeniería de detalle": "FinFaseIII",
  "Fase IV — Ejecución": "FinFaseIV",
  "Fase V — Cierre": "FinFaseV",
};

function fechaGraph(fechaIso: string | undefined): string | undefined {
  if (!fechaIso) return undefined;
  return `${fechaIso}T00:00:00Z`;
}

/**
 * Convierte un Proyecto de la app en el conjunto de campos ("fields")
 * que espera la lista de SharePoint, usando los nombres INTERNOS
 * reales de las columnas (no los nombres visibles ni los del
 * documento de especificación original en inglés).
 *
 * NOTA: Sponsor y ProjectManager (columnas "Persona o grupo") no se
 * incluyen todavía — escribir en ese tipo de columna vía Graph
 * requiere resolver el ID interno de cada usuario en el sitio. Se
 * rellenan a mano en SharePoint tras la subida inicial.
 */
export function proyectoAFieldsSharePoint(
  proyecto: Proyecto,
): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    Title: proyecto.nombre,
    ProjectID: proyecto.codigo,
    Tipo: proyecto.categoria,
    Rigurosidad: proyecto.rigurosidad,
    Objetivoestrat_x00e9_gico: proyecto.objetivoEstrategico,
    Fase: proyecto.fase,
    Estadodegates_x0028_JSON_x0029_: JSON.stringify(proyecto.gateStatus),
    Gateactual: proyecto.gateActual,
    Presupuestoaprobado: proyecto.presupuestoAprobado,
    ETC: proyecto.etc,
    Actuals: proyecto.importeGastado,
    ImporteComprometido: proyecto.importeComprometido,
    Estado: proyecto.estado,
    Descripci_x00f3_n: proyecto.descripcion,
    Carryover2025: proyecto.carryover2025,
  };

  if (proyecto.costCenter) {
    fields.CostCenter = proyecto.costCenter;
  }

  if (proyecto.numeroJobBC) fields.BCJobNumber = proyecto.numeroJobBC;
  if (proyecto.fechaProximoGate)
    fields.Fechapr_x00f3_ximogate = fechaGraph(proyecto.fechaProximoGate);
  if (proyecto.fechaUltimoGate)
    fields.Fecha_x00fa_ltimogate = fechaGraph(proyecto.fechaUltimoGate);
  if (proyecto.motivoCancelacion)
    fields.Motivodecancelaci_x00f3_n = proyecto.motivoCancelacion;
  if (proyecto.beneficioEsperado !== undefined)
    fields.Beneficioesperado = String(proyecto.beneficioEsperado);
  if (proyecto.exposicionRiesgo !== undefined)
    // La columna es de tipo texto en SharePoint (no numérica), se envía como cadena.
    fields.Exposici_x00f3_nalriesgo = String(proyecto.exposicionRiesgo);

  ORDEN_FASES.forEach((fase) => {
    const detalle = proyecto.detallePorFase[fase];
    const campoCoste = CAMPO_COSTE_FASE[fase];
    const campoInicio = CAMPO_INICIO_FASE[fase];
    const campoFin = CAMPO_FIN_FASE[fase];

    if (detalle?.coste !== undefined && campoCoste) {
      fields[campoCoste] = detalle.coste;
    }
    if (detalle?.fechaInicio && campoInicio) {
      fields[campoInicio] = fechaGraph(detalle.fechaInicio);
    }
    if (detalle?.fechaFin && campoFin) {
      fields[campoFin] = fechaGraph(detalle.fechaFin);
    }
  });

  return fields;
}

/**
 * Convierte un elemento leído de la lista de SharePoint (fields) de
 * vuelta a un Proyecto de la app. Rellena con valores por defecto los
 * campos que la lista no contempla directamente (departamento, tipo
 * de inversión CAPEX/OPEX, prioridad, avance, propietario, nivel de
 * riesgo, horizonte temporal).
 */
export function itemSharePointAProyecto(
  fields: Record<string, unknown>,
): Proyecto {
  const textoDe = (v: unknown) => (v === null || v === undefined ? undefined : String(v));

  const codigo = textoDe(fields.ProjectID) ?? textoDe(fields.Title) ?? "SIN-CODIGO";
  const gateActual = (textoDe(fields.Gateactual) as Proyecto["gateActual"]) ?? "G0";

  let gateStatus: number[];
  try {
    const crudo = fields.Estadodegates_x0028_JSON_x0029_;
    gateStatus = crudo ? JSON.parse(String(crudo)) : derivarGateStatusDesdeGateActual(gateActual);
  } catch {
    gateStatus = derivarGateStatusDesdeGateActual(gateActual);
  }

  const detallePorFase: Proyecto["detallePorFase"] = {};
  ORDEN_FASES.forEach((fase) => {
    const campoCoste = CAMPO_COSTE_FASE[fase];
    const campoInicio = CAMPO_INICIO_FASE[fase];
    const campoFin = CAMPO_FIN_FASE[fase];

    const coste = campoCoste ? (fields[campoCoste] as number | undefined) : undefined;
    const fechaInicio = campoInicio ? textoDe(fields[campoInicio])?.slice(0, 10) : undefined;
    const fechaFin = campoFin ? textoDe(fields[campoFin])?.slice(0, 10) : undefined;

    if (coste !== undefined || fechaInicio || fechaFin) {
      detallePorFase[fase] = { coste, fechaInicio, fechaFin };
    }
  });

  const presupuesto = (fields.Presupuestoaprobado as number) ?? 0;
  const gastado = (fields.Actuals as number) ?? 0;

  return {
    id: codigo,
    codigo,
    nombre: textoDe(fields.Title) ?? codigo,
    descripcion: textoDe(fields.Descripci_x00f3_n) ?? textoDe(fields.Title) ?? "",
    responsable: "Por asignar",
    departamento: "Mantenimiento",
    tipo: "CAPEX",
    fase: (textoDe(fields.Fase) as FaseProyecto) ?? "Fase IV — Ejecución",
    rigurosidad: (textoDe(fields.Rigurosidad) as Proyecto["rigurosidad"]) ?? "R2",
    presupuestoAprobado: presupuesto,
    importeComprometido: (fields.ImporteComprometido as number) ?? 0,
    importeGastado: gastado,
    fechaInicio: "2025-01-01",
    fechaFinPrevista: "2026-12-31",
    avance: presupuesto > 0 ? Math.min(100, Math.round((gastado / presupuesto) * 100)) : 0,
    prioridad: "Media",
    observaciones: "",
    categoria: (textoDe(fields.Tipo) as Proyecto["categoria"]) ?? "Protección de valor",
    estado: (textoDe(fields.Estado) as Proyecto["estado"]) ?? "En curso",
    objetivoEstrategico:
      (textoDe(fields.Objetivoestrat_x00e9_gico) as Proyecto["objetivoEstrategico"]) ??
      "Fiabilidad operativa",
    propietario: "Por asignar",
    sponsor: "Por asignar",
    gateActual,
    gateStatus,
    fechaProximoGate: textoDe(fields.Fechapr_x00f3_ximogate)?.slice(0, 10),
    fechaUltimoGate: textoDe(fields.Fecha_x00fa_ltimogate)?.slice(0, 10),
    etc: (fields.ETC as number) ?? 0,
    numeroJobBC: textoDe(fields.BCJobNumber) ?? null,
    exposicionRiesgo: fields.Exposici_x00f3_nalriesgo as number | undefined,
    beneficioEsperado: fields.Beneficioesperado
      ? Number(fields.Beneficioesperado)
      : undefined,
    motivoCancelacion: textoDe(fields.Motivodecancelaci_x00f3_n),
    nivelRiesgo: "Medio",
    horizonteTemporal: "Corto plazo",
    detallePorFase,
    gastoMensual2026: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    carryover2025: (fields.Carryover2025 as number) ?? 0,
    costCenter: (fields.CostCenter as string) || undefined,
  };
}
