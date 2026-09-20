import { llamarBC, codigoParaBC } from "@/lib/businesscentral/bcClient";

interface MovimientoCapex {
  PostingDate: string;
  Amount: number;
}

interface LineaCompra {
  OrderDate: string;
  AmountLCY_FCY: number;
}

export interface ResultadoActualsBC {
  total: number;
  /** Gasto por mes de 2026, índice 0 = enero .. 11 = diciembre. */
  mensual2026: number[];
}

/**
 * Consulta los movimientos contables reales (facturas) de un
 * proyecto en Business Central y los agrega en un total y un
 * desglose mensual de 2026.
 */
export async function obtenerActualsDesdeBC(
  codigoProyecto: string,
  costCenter: string,
): Promise<ResultadoActualsBC> {
  const capex = codigoParaBC(codigoProyecto);
  const query = `?capex=${encodeURIComponent(capex)}&costCenter=${encodeURIComponent(
    costCenter,
  )}&regDateStart=2020-01-01&regDateEnd=2026-12-31`;

  const datos = (await llamarBC(
    `/CapexAccountMovs${query}`,
  )) as MovimientoCapex[];

  const mensual2026 = new Array(12).fill(0);
  let total = 0;

  for (const mov of datos ?? []) {
    total += mov.Amount ?? 0;

    const fecha = new Date(mov.PostingDate);
    if (fecha.getFullYear() === 2026) {
      mensual2026[fecha.getMonth()] += mov.Amount ?? 0;
    }
  }

  return { total, mensual2026 };
}

/**
 * Consulta las líneas de pedidos de compra (compromisos, aún no
 * necesariamente facturados) de un proyecto, y devuelve el total
 * comprometido.
 */
export async function obtenerComprometidoDesdeBC(
  codigoProyecto: string,
  costCenter: string,
): Promise<number> {
  const capex = codigoParaBC(codigoProyecto);
  const query = `?capex=${encodeURIComponent(capex)}&costCenter=${encodeURIComponent(
    costCenter,
  )}&regDateStart=2020-01-01&regDateEnd=2026-12-31`;

  const datos = (await llamarBC(`/PurchaseLines${query}`)) as LineaCompra[];

  return (datos ?? []).reduce(
    (total, linea) => total + (linea.AmountLCY_FCY ?? 0),
    0,
  );
}
