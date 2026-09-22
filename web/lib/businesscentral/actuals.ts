import { llamarBC, codigoParaBC } from "@/lib/businesscentral/bcClient";

interface MovimientoCapex {
  PostingDate: string;
  Amount: number;
  GLAccountNo?: string;
}

/**
 * El IVA soportado viene como una línea contable SEPARADA (no
 * incluido dentro del importe de la línea de gasto), en cuentas que
 * empiezan por "472" (plan contable español: IVA soportado). Hay que
 * excluir estas líneas para no sumar el IVA como si fuera gasto.
 */
function esLineaDeIva(cuenta: string | undefined): boolean {
  return Boolean(cuenta && cuenta.startsWith("472"));
}

interface LineaCompra {
  OrderDate: string;
  DocumentNo: string;
  VendorName?: string;
  AmountLCY_FCY: number;
  OutstandingAmount: number;
  AmtRcdNotInvoiced: number;
}

export interface ResultadoActualsBC {
  total: number;
  /** Gasto por mes de 2026, índice 0 = enero .. 11 = diciembre. */
  mensual2026: number[];
}

export interface DetallePOPendiente {
  documentNo: string;
  vendorName?: string;
  importe: number;
}

export interface ResultadoComprasBC {
  totalPedido: number;
  totalPendienteRecibir: number;
  totalRecibidoNoFacturado: number;
  /** Desglose por mes del año consultado, agrupado por OrderDate. */
  pedidoPorMes: number[];
  pendienteRecibirPorMes: number[];
  /** Detalle de cada PO (pedido) que todavía tiene importe pendiente de recibir. */
  pendientesDetalle: DetallePOPendiente[];
  /** Detalle de cada PO recibida pero todavía sin facturar. */
  recibidosNoFacturadosDetalle: DetallePOPendiente[];
}

const FACTOR_IVA = 1.21;

/**
 * OutstandingAmount y AmtRcdNotInvoiced de PurchaseLines vienen con
 * el 21% de IVA incluido (verificado matemáticamente comparando con
 * Quantity y Quantity_Received de varias líneas reales de P022:
 * la diferencia de cantidades coincide exactamente con el importe
 * dividido entre 1.21). AmountLCY_FCY, en cambio, ya está en base
 * imponible (coincide con Quantity), así que ese NO se divide.
 */
function sinIva(importeConIva: number): number {
  return importeConIva / FACTOR_IVA;
}

async function consultarPurchaseLines(
  codigoProyecto: string,
  costCenter: string,
): Promise<LineaCompra[]> {
  const capex = codigoParaBC(codigoProyecto);
  const query = `?capex=${encodeURIComponent(capex)}&costCenter=${encodeURIComponent(
    costCenter,
  )}&regDateStart=2020-01-01&regDateEnd=2027-12-31`;

  return ((await llamarBC(`/PurchaseLines${query}`)) as LineaCompra[]) ?? [];
}

/**
 * Consulta los movimientos contables reales (facturas) de un
 * proyecto en Business Central y los agrega en un total y un
 * desglose mensual de 2026. El campo "Amount" viene con el 21% de
 * IVA incluido, así que se quita antes de sumarlo.
 */
export async function obtenerActualsDesdeBC(
  codigoProyecto: string,
  costCenter: string,
): Promise<ResultadoActualsBC> {
  const capex = codigoParaBC(codigoProyecto);
  const query = `?capex=${encodeURIComponent(capex)}&costCenter=${encodeURIComponent(
    costCenter,
  )}&regDateStart=2020-01-01&regDateEnd=2027-12-31`;

  const datos = (await llamarBC(
    `/CapexAccountMovs${query}`,
  )) as MovimientoCapex[];

  const mensual2026 = new Array(12).fill(0);
  let total = 0;

  // El IVA soportado viene como una línea contable separada (cuenta
  // 472xxxxx), no incluido dentro del importe de la línea de gasto.
  // Se excluyen esas líneas para no sumar el IVA como si fuera gasto
  // real del proyecto (confirmado con datos reales de P022 y P009).
  for (const mov of datos ?? []) {
    if (esLineaDeIva(mov.GLAccountNo)) {
      continue;
    }

    const importe = mov.Amount ?? 0;
    total += importe;

    const fecha = new Date(mov.PostingDate);
    if (fecha.getFullYear() === 2026) {
      mensual2026[fecha.getMonth()] += importe;
    }
  }

  return { total, mensual2026 };
}

/**
 * Consulta las líneas de pedidos de compra y devuelve el total
 * comprometido (histórico completo, sin IVA). Se mantiene para no
 * romper la ruta de sincronización que ya la usa.
 */
export async function obtenerComprometidoDesdeBC(
  codigoProyecto: string,
  costCenter: string,
): Promise<number> {
  const lineas = await consultarPurchaseLines(codigoProyecto, costCenter);
  return lineas.reduce((total, linea) => total + (linea.AmountLCY_FCY ?? 0), 0);
}

/**
 * Consulta las líneas de pedidos de compra y devuelve los 3 totales
 * (pedido, pendiente de recibir, recibido sin facturar), el desglose
 * por mes del año consultado, y el detalle de cada PO. El importe
 * pedido (AmountLCY_FCY) ya viene sin IVA; OutstandingAmount y
 * AmtRcdNotInvoiced sí lo llevan incluido, así que se quita antes de
 * sumarlos o mostrarlos.
 */
export async function obtenerDesgloseComprasDesdeBC(
  codigoProyecto: string,
  costCenter: string,
  anio: number,
): Promise<ResultadoComprasBC> {
  const lineas = await consultarPurchaseLines(codigoProyecto, costCenter);

  let totalPedido = 0;
  let totalPendienteRecibir = 0;
  let totalRecibidoNoFacturado = 0;
  const pedidoPorMes = new Array(12).fill(0);
  const pendienteRecibirPorMes = new Array(12).fill(0);
  const pendientesDetalle: DetallePOPendiente[] = [];
  const recibidosNoFacturadosDetalle: DetallePOPendiente[] = [];

  // PurchaseLines no desglosa el IVA como línea separada (no tiene
  // ningún campo de cuenta contable, a diferencia de
  // CapexAccountMovs): AmountLCY_FCY, OutstandingAmount y
  // AmtRcdNotInvoiced son importes de pedido "puros", tal cual.
  for (const linea of lineas) {
    const pendiente = sinIva(linea.OutstandingAmount ?? 0);
    const recibido = sinIva(linea.AmtRcdNotInvoiced ?? 0);

    totalPedido += linea.AmountLCY_FCY ?? 0;
    totalPendienteRecibir += pendiente;
    totalRecibidoNoFacturado += recibido;

    if (pendiente > 0) {
      pendientesDetalle.push({
        documentNo: linea.DocumentNo,
        vendorName: linea.VendorName,
        importe: pendiente,
      });
    }

    if (recibido > 0) {
      recibidosNoFacturadosDetalle.push({
        documentNo: linea.DocumentNo,
        vendorName: linea.VendorName,
        importe: recibido,
      });
    }

    const fecha = new Date(linea.OrderDate);
    if (fecha.getFullYear() === anio) {
      const mes = fecha.getMonth();
      pedidoPorMes[mes] += linea.AmountLCY_FCY ?? 0;
      pendienteRecibirPorMes[mes] += pendiente;
    }
  }

  return {
    totalPedido,
    totalPendienteRecibir,
    totalRecibidoNoFacturado,
    pedidoPorMes,
    pendienteRecibirPorMes,
    pendientesDetalle,
    recibidosNoFacturadosDetalle,
  };
}
