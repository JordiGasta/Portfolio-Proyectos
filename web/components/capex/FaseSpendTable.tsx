"use client";

import { useState } from "react";
import type { Proyecto } from "@/types/proyecto";
import DetalleProyectoModal from "@/components/proyectos/DetalleProyectoModal";
import { ordenFases } from "@/lib/proyectos/calculos";
import { formatearEuros } from "@/lib/format/formato";

interface FaseSpendTableProps {
  proyectos: Proyecto[];
}

export default function FaseSpendTable({ proyectos }: FaseSpendTableProps) {
  const [proyectoSeleccionado, setProyectoSeleccionado] =
    useState<Proyecto | null>(null);

  const obtenerCosteFase = (proyecto: Proyecto, fase: string) =>
    proyecto.detallePorFase[fase as keyof typeof proyecto.detallePorFase]
      ?.coste ?? 0;

  const obtenerTotal = (proyecto: Proyecto) =>
    ordenFases.reduce(
      (total, fase) => total + obtenerCosteFase(proyecto, fase),
      0,
    );

  const totalesPorFase = ordenFases.map((fase) =>
    proyectos.reduce((total, proyecto) => total + obtenerCosteFase(proyecto, fase), 0),
  );

  const totalGeneral = proyectos.reduce(
    (total, proyecto) => total + obtenerTotal(proyecto),
    0,
  );

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-base font-semibold text-slate-900">
          Reparto de coste por fase
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Proyecto</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              {ordenFases.map((fase) => (
                <th key={fase} className="px-3 py-3 text-right font-medium">
                  {fase.split("—")[0].trim()}
                </th>
              ))}
              <th className="px-5 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {proyectos.map((proyecto) => (
              <tr
                key={proyecto.id}
                onClick={() => setProyectoSeleccionado(proyecto)}
                className="cursor-pointer hover:bg-slate-50"
              >
                <td className="max-w-[200px] truncate px-5 py-3 font-medium" title={proyecto.nombre}>
                  {proyecto.nombre}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {proyecto.categoria}
                </td>
                {ordenFases.map((fase) => (
                  <td key={fase} className="px-3 py-3 text-right text-xs">
                    {obtenerCosteFase(proyecto, fase) > 0
                      ? formatearEuros(obtenerCosteFase(proyecto, fase))
                      : "—"}
                  </td>
                ))}
                <td className="px-5 py-3 text-right font-medium">
                  {formatearEuros(obtenerTotal(proyecto))}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
              <td className="px-5 py-3" colSpan={2}>
                Total
              </td>
              {totalesPorFase.map((total, indice) => (
                <td key={ordenFases[indice]} className="px-3 py-3 text-right text-xs">
                  {formatearEuros(Math.round(total))}
                </td>
              ))}
              <td className="px-5 py-3 text-right">
                {formatearEuros(Math.round(totalGeneral))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {proyectoSeleccionado && (
        <DetalleProyectoModal
          proyecto={proyectoSeleccionado}
          onCerrar={() => setProyectoSeleccionado(null)}
        />
      )}
    </article>
  );
}
