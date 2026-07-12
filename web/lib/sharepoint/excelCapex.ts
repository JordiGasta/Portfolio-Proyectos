import type {
  CategoriaProyecto,
  DetalleFase,
  EstadoProyecto,
  FaseProyecto,
  Gate,
  ObjetivoEstrategico,
  Proyecto,
} from "@/types/proyecto";
import { derivarGateStatusDesdeGateActual } from "@/lib/proyectos/calculos";
import { obtenerConfiguracionSharePoint } from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

const NOMBRE_HOJA = "USAGE CAPEX";
const FILA_INICIO_DATOS = 5; // 1-indexado, igual que en Excel

const NOMBRES_FASE: FaseProyecto[] = [
  "Fase 0 — Fase previa",
  "Fase I — Inicio / Project Charter",
  "Fase IIA — Análisis de escenarios",
  "Fase IIB — Ingeniería básica solución escogida",
  "Fase III — Ingeniería de detalle",
  "Fase IV — Ejecución",
  "Fase V — Cierre",
];

const FASES_VALIDAS = new Set<string>(NOMBRES_FASE);
const ESTADOS_VALIDOS = new Set<string>([
  "En curso", "En riesgo", "Fuera de control", "En pausa", "Cancelado",
]);
const GATES_VALIDOS = new Set<string>(["G0", "G1", "G2A", "G2B", "G3", "G4", "G5"]);
const BUCKETS_VALIDOS = new Set<string>([
  "Fiabilidad operativa", "Energía y coste", "Calidad y seguridad alimentaria",
  "Backbone digital", "Cumplimiento normativo",
]);

function celda(fila: unknown[], columna1: number): unknown {
  return fila[columna1 - 1];
}

function textoDe(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
}

function numeroDe(valor: unknown): number {
  if (typeof valor === "number") return valor;
  const texto = textoDe(valor).replace(/[^\d.-]/g, "");
  const n = Number(texto);
  return Number.isFinite(n) ? n : 0;
}

/** Excel puede devolver fechas como serial numérico o como texto ISO. */
function fechaDe(valor: unknown): string | undefined {
  const texto = textoDe(valor);
  if (!texto) return undefined;

  if (typeof valor === "number") {
    // Serial de Excel: día 0 = 30/12/1899.
    const base = new Date(Date.UTC(1899, 11, 30));
    const fecha = new Date(base.getTime() + valor * 86400000);
    return fecha.toISOString().slice(0, 10);
  }

  const fecha = new Date(texto);
  if (!Number.isNaN(fecha.getTime())) {
    return fecha.toISOString().slice(0, 10);
  }
  return undefined;
}

function mapearCategoria(textoCategoria: string): CategoriaProyecto {
  if (/compliance|legal|environment|port|safety/i.test(textoCategoria)) {
    return "Obligatorio";
  }
  if (/growth|new/i.test(textoCategoria)) {
    return "Creación de valor";
  }
  return "Protección de valor";
}

/**
 * Convierte una fila de la hoja "USAGE CAPEX" en un Proyecto.
 * Devuelve null si la fila no tiene código de proyecto (fin de datos).
 *
 * Campos que el Excel no contempla se rellenan con valores por
 * defecto razonables (Rigurosidad, Tipo, Departamento, Prioridad,
 * Nivel de riesgo, Horizonte temporal).
 */
function mapearFilaAProyecto(fila: unknown[], indiceFila: number): Proyecto | null {
  const codigo = textoDe(celda(fila, 1));
  if (!codigo) return null;

  const categoriaExcel = textoDe(celda(fila, 2));
  const descripcion = textoDe(celda(fila, 4)) || codigo;
  const aprobado = numeroDe(celda(fila, 5));
  const carryover = numeroDe(celda(fila, 6));
  const presupuesto = aprobado + carryover;

  const meses: number[] = [];
  for (let i = 0; i < 12; i += 1) {
    meses.push(numeroDe(celda(fila, 7 + i)));
  }
  const gastado = meses.reduce((total, valor) => total + valor, 0);

  const faseTexto = textoDe(celda(fila, 30));
  const fase: FaseProyecto = FASES_VALIDAS.has(faseTexto)
    ? (faseTexto as FaseProyecto)
    : "Fase IV — Ejecución";

  const sponsor = textoDe(celda(fila, 31)) || "Por asignar";
  const responsable = textoDe(celda(fila, 32)) || "Por asignar";

  const estadoTexto = textoDe(celda(fila, 33));
  const estado: EstadoProyecto = ESTADOS_VALIDOS.has(estadoTexto)
    ? (estadoTexto as EstadoProyecto)
    : "En curso";

  const gateTexto = textoDe(celda(fila, 34));
  const gateActual: Gate = GATES_VALIDOS.has(gateTexto) ? (gateTexto as Gate) : "G0";

  const fechaProximoGate = fechaDe(celda(fila, 35));
  const fechaUltimoGate = fechaDe(celda(fila, 36));

  const bucketTexto = textoDe(celda(fila, 37));
  const objetivoEstrategico: ObjetivoEstrategico = BUCKETS_VALIDOS.has(bucketTexto)
    ? (bucketTexto as ObjetivoEstrategico)
    : "Fiabilidad operativa";

  // Histórico por fase: columnas 38..51, pares (coste, fin).
  const detallePorFase: Proyecto["detallePorFase"] = {};
  let ultimaFechaFin: string | undefined;
  let columna = 38;
  NOMBRES_FASE.forEach((nombreFase) => {
    const coste = numeroDe(celda(fila, columna));
    const fin = fechaDe(celda(fila, columna + 1));
    if (coste > 0 || fin) {
      const detalle: DetalleFase = {};
      if (coste > 0) detalle.coste = coste;
      if (fin) {
        detalle.fechaFin = fin;
        ultimaFechaFin = fin;
      }
      detallePorFase[nombreFase] = detalle;
    }
    columna += 2;
  });

  const categoria = mapearCategoria(categoriaExcel);
  const anioProyecto = numeroDe(celda(fila, 3)) || new Date().getFullYear();

  return {
    id: codigo,
    codigo,
    nombre: descripcion,
    descripcion,
    responsable,
    departamento: "Mantenimiento",
    tipo: "CAPEX",
    fase,
    rigurosidad: "R2",
    presupuestoAprobado: presupuesto,
    importeComprometido: gastado,
    importeGastado: gastado,
    fechaInicio: `${anioProyecto}-01-01`,
    fechaFinPrevista: ultimaFechaFin ?? `${anioProyecto}-12-31`,
    avance: presupuesto > 0 ? Math.min(100, Math.round((gastado / presupuesto) * 100)) : 0,
    prioridad: "Media",
    observaciones: "",
    categoria,
    estado,
    objetivoEstrategico,
    propietario: responsable,
    sponsor,
    gateActual,
    gateStatus: derivarGateStatusDesdeGateActual(gateActual),
    fechaProximoGate,
    fechaUltimoGate,
    etc: Math.max(0, presupuesto - gastado),
    numeroJobBC: null,
    exposicionRiesgo: categoria === "Obligatorio" ? Math.round(presupuesto * 0.5) : undefined,
    beneficioEsperado: categoria === "Creación de valor" ? Math.round(presupuesto * 0.3) : undefined,
    nivelRiesgo: "Medio",
    horizonteTemporal: "Corto plazo",
    detallePorFase,
    gastoMensual2026: meses,
  };
}

/**
 * Lee el Excel real desde SharePoint (vía la API de workbook de
 * Microsoft Graph) y lo convierte en la lista de proyectos de la
 * aplicación. Lanza un error si la conexión o el archivo fallan; la
 * ruta de API que llama a esta función se encarga de capturarlo.
 */
export async function leerProyectosDesdeExcel(): Promise<Proyecto[]> {
  const config = obtenerConfiguracionSharePoint();
  if (!config) {
    throw new Error("SharePoint no está configurado.");
  }

  const rutaHoja = encodeURIComponent(NOMBRE_HOJA);
  const datos = (await llamarGraph(
    `/sites/${config.siteId}/drive/root:${config.excelPath}:/workbook/worksheets('${rutaHoja}')/usedRange(valuesOnly=true)`,
  )) as { values: unknown[][] };

  const filas = datos.values ?? [];
  const proyectos: Proyecto[] = [];

  for (let i = FILA_INICIO_DATOS - 1; i < filas.length; i += 1) {
    const proyecto = mapearFilaAProyecto(filas[i], i + 1);
    if (proyecto) {
      proyectos.push(proyecto);
    }
  }

  return proyectos;
}
