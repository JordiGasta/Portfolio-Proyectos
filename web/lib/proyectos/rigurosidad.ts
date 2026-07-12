import type { FaseProyecto, Gate, Rigurosidad } from "@/types/proyecto";
import { ordenFases } from "@/lib/proyectos/calculos";

export type AplicacionFase = "obligatoria" | "opcional" | "no-aplica";

/**
 * Aplicación de cada fase según la rigurosidad del proyecto, según el
 * documento de especificaciones ("Aplicación de fases según
 * rigurosidad del proyecto").
 */
const MATRIZ: Record<FaseProyecto, Record<Rigurosidad, AplicacionFase>> = {
  "Fase 0 — Fase previa": {
    R1: "no-aplica",
    R2: "opcional",
    R3: "obligatoria",
  },
  "Fase I — Inicio / Project Charter": {
    R1: "obligatoria",
    R2: "obligatoria",
    R3: "obligatoria",
  },
  "Fase IIA — Análisis de escenarios": {
    R1: "no-aplica",
    R2: "opcional",
    R3: "obligatoria",
  },
  "Fase IIB — Ingeniería básica solución escogida": {
    R1: "no-aplica",
    R2: "no-aplica",
    R3: "obligatoria",
  },
  "Fase III — Ingeniería de detalle": {
    R1: "no-aplica",
    R2: "obligatoria",
    R3: "obligatoria",
  },
  "Fase IV — Ejecución": {
    R1: "obligatoria",
    R2: "obligatoria",
    R3: "obligatoria",
  },
  "Fase V — Cierre": {
    R1: "no-aplica",
    R2: "obligatoria",
    R3: "obligatoria",
  },
};

export function aplicacionDeFase(
  fase: FaseProyecto,
  rigurosidad: Rigurosidad,
): AplicacionFase {
  return MATRIZ[fase][rigurosidad];
}

/** Fases que aplican (obligatorias u opcionales) a una rigurosidad, en orden. */
export function fasesAplicables(rigurosidad: Rigurosidad): FaseProyecto[] {
  return ordenFases.filter(
    (fase) => aplicacionDeFase(fase, rigurosidad) !== "no-aplica",
  );
}


/** Correspondencia posicional entre cada fase y su gate. */
const GATE_POR_FASE: Record<FaseProyecto, Gate> = {
  "Fase 0 — Fase previa": "G0",
  "Fase I — Inicio / Project Charter": "G1",
  "Fase IIA — Análisis de escenarios": "G2A",
  "Fase IIB — Ingeniería básica solución escogida": "G2B",
  "Fase III — Ingeniería de detalle": "G3",
  "Fase IV — Ejecución": "G4",
  "Fase V — Cierre": "G5",
};

/** Gates aplicables (correspondientes a fases obligatorias u opcionales) a una rigurosidad, en orden. */
export function gatesAplicables(rigurosidad: Rigurosidad): Gate[] {
  return fasesAplicables(rigurosidad).map((fase) => GATE_POR_FASE[fase]);
}
