import { obtenerConfiguracionBC } from "@/lib/businesscentral/configuracion";
import { llamarBusinessCentral } from "@/lib/businesscentral/bcClient";

interface JobLedgerEntryBC {
  postingDate: string; // ISO, p. ej. "2026-03-15"
  totalCost: number;
}

export interface ActualsBC {
  jobNo: string;
  total: number;
  /** Gasto por mes de 2026, índice 0 = enero .. 11 = diciembre. */
  mensual2026: number[];
}

/**
 * Consulta los asientos de coste (Job Ledger Entries) de un Job de
 * Business Central y los agrega en un total y un desglose mensual de
 * 2026, para sustituir el gasto introducido a mano por el dato real.
 */
export async function obtenerActualsDesdeBC(jobNo: string): Promise<ActualsBC> {
  const config = obtenerConfiguracionBC();
  if (!config) {
    throw new Error("Business Central no está configurado.");
  }

  const filtro = encodeURIComponent(`jobNo eq '${jobNo}'`);
  const datos = (await llamarBusinessCentral(
    `/companies(${config.companyId})/jobLedgerEntries?$filter=${filtro}`,
  )) as { value: JobLedgerEntryBC[] };

  const mensual2026 = new Array(12).fill(0);
  let total = 0;

  for (const entrada of datos.value ?? []) {
    total += entrada.totalCost ?? 0;

    const fecha = new Date(entrada.postingDate);
    if (fecha.getFullYear() === 2026) {
      mensual2026[fecha.getMonth()] += entrada.totalCost ?? 0;
    }
  }

  return { jobNo, total, mensual2026 };
}
