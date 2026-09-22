"use client";

import { useEffect, useState } from "react";
import type { Proyecto } from "@/types/proyecto";
import { formatearEuros } from "@/lib/format/formato";

interface PresupuestoVsGastoAcumuladoChartProps {
  proyectos: Proyecto[];
  historico: Array<{ projectId: string; anio: number; presupuestoAnual: number }>;
  anio: number;
}

interface DetallePO {
  documentNo: string;
  vendorName?: string;
  importe: number;
}

interface DesgloseComprasProyecto {
  codigo: string;
  ok: boolean;
  totalPedido?: number;
  totalPendienteRecibir?: number;
  totalRecibidoNoFacturado?: number;
  pendientesDetalle?: DetallePO[];
  recibidosNoFacturadosDetalle?: DetallePO[];
}

type Categoria = "presupuesto" | "pedido" | "gastado" | "recibidoNoFacturado" | "pendiente";

interface FilaProyecto {
  codigo: string;
  nombre: string;
  presupuesto: number;
  pedido: number;
  gastado: number;
  recibidoNoFacturado: number;
  pendiente: number;
  recibidosNoFacturadosDetalle: DetallePO[];
  pendientesDetalle: DetallePO[];
}

const ALTURA_GRAFICO = 240;

const CATEGORIAS: Categoria[] = ["presupuesto", "pedido", "gastado", "recibidoNoFacturado", "pendiente"];

const ETIQUETAS: Record<Categoria, string> = {
  presupuesto: "Presupuesto",
  pedido: "Pedido total",
  gastado: "Gastado",
  recibidoNoFacturado: "Recibido sin facturar",
  pendiente: "Pendiente de recibir",
};

// Presupuesto y Gastado usan los mismos colores que el gráfico de semestres.
const COLORES: Record<Categoria, string> = {
  presupuesto: "bg-blue-500",
  pedido: "bg-indigo-500",
  gastado: "bg-amber-500",
  recibidoNoFacturado: "bg-emerald-500",
  pendiente: "bg-rose-500",
};

export default function PresupuestoVsGastoAcumuladoChart({
  proyectos,
  historico,
  anio,
}: PresupuestoVsGastoAcumuladoChartProps) {
  const [desglose, setDesglose] = useState<DesgloseComprasProyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [configurado, setConfigurado] = useState(true);
  const [tablaAbierta, setTablaAbierta] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);

    async function cargar() {
      try {
        const respuesta = await fetch(
          `/api/businesscentral/desglose-compras?anio=${anio}`,
          { cache: "no-store" },
        );
        const datos = await respuesta.json();
        if (activo) {
          setConfigurado(datos.configurado ?? false);
          setDesglose(datos.proyectos ?? []);
        }
      } catch {
        if (activo) setConfigurado(false);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [anio]);

  if (cargando) {
    return (
      <article className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Cargando desglose de compras…</p>
      </article>
    );
  }

  if (!configurado) {
    return (
      <article className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">
          Presupuesto, pedido, gastado y pendiente de recibir
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Este gráfico necesita la conexión con Business Central configurada.
        </p>
      </article>
    );
  }

  // Construye una fila por proyecto con las 5 columnas, para la tabla única.
  const filas: FilaProyecto[] = proyectos
    .map((p) => {
      const filaHistorico = historico.find(
        (h) => h.anio === anio && h.projectId === p.codigo,
      );
      const filaBC = desglose.find((d) => d.codigo === p.codigo && d.ok);

      const gastado =
        anio === 2026
          ? (p.gastoMensual2026 ?? []).reduce((t, v) => t + (v ?? 0), 0)
          : 0;

      return {
        codigo: p.codigo,
        nombre: p.nombre,
        presupuesto: filaHistorico?.presupuestoAnual ?? 0,
        pedido: filaBC?.totalPedido ?? 0,
        gastado,
        recibidoNoFacturado: filaBC?.totalRecibidoNoFacturado ?? 0,
        pendiente: filaBC?.totalPendienteRecibir ?? 0,
        recibidosNoFacturadosDetalle: filaBC?.recibidosNoFacturadosDetalle ?? [],
        pendientesDetalle: filaBC?.pendientesDetalle ?? [],
      };
    })
    .filter(
      (f) =>
        f.presupuesto > 0 ||
        f.pedido > 0 ||
        f.gastado > 0 ||
        f.recibidoNoFacturado > 0 ||
        f.pendiente > 0,
    );

  const totales: Record<Categoria, number> = {
    presupuesto: filas.reduce((t, f) => t + f.presupuesto, 0),
    pedido: filas.reduce((t, f) => t + f.pedido, 0),
    gastado: filas.reduce((t, f) => t + f.gastado, 0),
    recibidoNoFacturado: filas.reduce((t, f) => t + f.recibidoNoFacturado, 0),
    pendiente: filas.reduce((t, f) => t + f.pendiente, 0),
  };

  const maximo = Math.max(1, ...Object.values(totales));

  return (
    <article className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">
        Presupuesto, pedido, gastado y pendiente de recibir — {anio}
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        Totales del año. Haz clic en cualquier barra para ver el desglose
        completo por proyecto.
      </p>

      <div className="mt-6 flex items-end justify-around gap-6">
        {CATEGORIAS.map((categoria) => {
          const valor = totales[categoria];
          const altura = Math.round((valor / maximo) * ALTURA_GRAFICO * 0.88);
          const tieneDatos = valor > 0;

          return (
            <button
              key={categoria}
              type="button"
              onClick={() => tieneDatos && setTablaAbierta(true)}
              className={`flex min-w-[110px] flex-1 flex-col items-center rounded-md p-2 transition ${
                tieneDatos ? "cursor-pointer hover:bg-slate-50" : "cursor-default"
              }`}
            >
              <div
                className="flex w-full items-end justify-center"
                style={{ height: ALTURA_GRAFICO }}
              >
                <div className="flex flex-col items-center justify-end">
                  <span className="mb-1 whitespace-nowrap text-[11px] font-medium text-slate-700">
                    {valor > 0 ? formatearEuros(Math.round(valor)) : "—"}
                  </span>
                  <div
                    className={`w-14 rounded-t-md ${COLORES[categoria]}`}
                    style={{ height: altura }}
                  />
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-slate-600">
                {ETIQUETAS[categoria]}
              </span>
            </button>
          );
        })}
      </div>

      {tablaAbierta && (
        <ModalDesgloseCompleto
          anio={anio}
          filas={filas}
          totales={totales}
          onCerrar={() => setTablaAbierta(false)}
        />
      )}
    </article>
  );
}

function ModalDesgloseCompleto({
  anio,
  filas,
  totales,
  onCerrar,
}: {
  anio: number;
  filas: FilaProyecto[];
  totales: Record<Categoria, number>;
  onCerrar: () => void;
}) {
  const [expandido, setExpandido] = useState<{
    codigo: string;
    tipo: "recibido" | "pendiente";
  } | null>(null);

  const ordenadas = [...filas].sort((a, b) => b.pedido - a.pedido);

  function alternarExpansion(codigo: string, tipo: "recibido" | "pendiente") {
    setExpandido((actual) =>
      actual?.codigo === codigo && actual.tipo === tipo
        ? null
        : { codigo, tipo },
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 py-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="w-full max-w-5xl rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-sm text-slate-500">Desglose completo por proyecto</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{anio}</h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Proyecto</th>
                <th className="pb-2 text-right font-medium">Presupuesto</th>
                <th className="pb-2 text-right font-medium">Pedido</th>
                <th className="pb-2 text-right font-medium">Gastado</th>
                <th className="pb-2 text-right font-medium">Recibido s/facturar</th>
                <th className="pb-2 text-right font-medium">Pendiente recibir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordenadas.map((f) => {
                const tieneRecibidos = f.recibidosNoFacturadosDetalle.length > 0;
                const tienePendientes = f.pendientesDetalle.length > 0;
                const expandidoRecibido =
                  expandido?.codigo === f.codigo && expandido.tipo === "recibido";
                const expandidoPendiente =
                  expandido?.codigo === f.codigo && expandido.tipo === "pendiente";

                return (
                  <>
                    <tr key={f.codigo}>
                      <td className="py-2 pr-4">
                        <div className="font-medium text-slate-900">{f.nombre}</div>
                        <div className="text-xs text-slate-500">{f.codigo}</div>
                      </td>
                      <td className="py-2 text-right text-slate-900">
                        {f.presupuesto > 0 ? formatearEuros(Math.round(f.presupuesto)) : "—"}
                      </td>
                      <td className="py-2 text-right text-slate-900">
                        {f.pedido > 0 ? formatearEuros(Math.round(f.pedido)) : "—"}
                      </td>
                      <td className="py-2 text-right text-slate-900">
                        {f.gastado > 0 ? formatearEuros(Math.round(f.gastado)) : "—"}
                      </td>
                      <td className="py-2 text-right text-slate-900">
                        <div className="flex items-center justify-end gap-1">
                          {f.recibidoNoFacturado > 0
                            ? formatearEuros(Math.round(f.recibidoNoFacturado))
                            : "—"}
                          {tieneRecibidos && (
                            <button
                              type="button"
                              onClick={() => alternarExpansion(f.codigo, "recibido")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Ver PO's"
                            >
                              {expandidoRecibido ? "▲" : "▼"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-right text-slate-900">
                        <div className="flex items-center justify-end gap-1">
                          {f.pendiente > 0 ? formatearEuros(Math.round(f.pendiente)) : "—"}
                          {tienePendientes && (
                            <button
                              type="button"
                              onClick={() => alternarExpansion(f.codigo, "pendiente")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Ver PO's"
                            >
                              {expandidoPendiente ? "▲" : "▼"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {(expandidoRecibido || expandidoPendiente) && (
                      <tr key={`${f.codigo}-detalle`}>
                        <td colSpan={6} className="bg-slate-50 px-2 py-2">
                          <p className="mb-1 pl-2 text-xs font-medium text-slate-500">
                            PO's{" "}
                            {expandidoRecibido
                              ? "recibidas sin facturar"
                              : "pendientes de recibir"}
                          </p>
                          <table className="w-full text-xs">
                            <thead className="text-slate-500">
                              <tr>
                                <th className="pb-1 pl-2 text-left font-medium">Nº PO</th>
                                <th className="pb-1 text-left font-medium">Proveedor</th>
                                <th className="pb-1 pr-2 text-right font-medium">Importe</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {(expandidoRecibido
                                ? f.recibidosNoFacturadosDetalle
                                : f.pendientesDetalle
                              ).map((po, i) => (
                                <tr key={`${po.documentNo}-${i}`}>
                                  <td className="py-1 pl-2 text-slate-700">
                                    {po.documentNo}
                                  </td>
                                  <td className="py-1 text-slate-700">
                                    {po.vendorName ?? "—"}
                                  </td>
                                  <td className="py-1 pr-2 text-right text-slate-700">
                                    {formatearEuros(Math.round(po.importe))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-semibold">
                <td className="pt-3">Total</td>
                <td className="pt-3 text-right">
                  {formatearEuros(Math.round(totales.presupuesto))}
                </td>
                <td className="pt-3 text-right">
                  {formatearEuros(Math.round(totales.pedido))}
                </td>
                <td className="pt-3 text-right">
                  {formatearEuros(Math.round(totales.gastado))}
                </td>
                <td className="pt-3 text-right">
                  {formatearEuros(Math.round(totales.recibidoNoFacturado))}
                </td>
                <td className="pt-3 text-right">
                  {formatearEuros(Math.round(totales.pendiente))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
