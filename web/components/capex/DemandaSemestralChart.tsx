"use client";

import { useState } from "react";
import type { Proyecto } from "@/types/proyecto";
import {
  calcularDatosPorSemestre,
  detectarSemestres,
  etiquetaSemestre,
  type DatosSemestre,
} from "@/lib/proyectos/semestres";
import { formatearEuros } from "@/lib/format/formato";

interface DemandaSemestralChartProps {
  proyectos: Proyecto[];
}

const ALTURA_GRAFICO = 240;

export default function DemandaSemestralChart({
  proyectos,
}: DemandaSemestralChartProps) {
  const semestres = detectarSemestres(proyectos);
  const datos = calcularDatosPorSemestre(proyectos, semestres);

  const [semestreSeleccionado, setSemestreSeleccionado] =
    useState<DatosSemestre | null>(null);

  const maximo = Math.max(
    1,
    ...datos.map((d) => Math.max(d.presupuesto, d.gastado)),
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">
        Presupuesto y gasto por semestre
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        Presupuesto: coste de cada fase en el semestre de su fecha de fin.
        Gasto: gasto mensual real (S1 = enero–junio, S2 = julio–diciembre).
        Haz clic en un semestre para ver el desglose por proyecto.
      </p>

      <div className="mt-8 flex items-end justify-around gap-4 overflow-x-auto">
        {datos.map((dato) => {
          const alturaPresupuesto = Math.round(
            (dato.presupuesto / maximo) * ALTURA_GRAFICO * 0.88,
          );
          const alturaGastado = Math.round(
            (dato.gastado / maximo) * ALTURA_GRAFICO * 0.88,
          );
          const tieneDatos = dato.presupuesto > 0 || dato.gastado > 0;

          return (
            <button
              key={etiquetaSemestre(dato.semestre)}
              type="button"
              onClick={() => tieneDatos && setSemestreSeleccionado(dato)}
              className={`flex min-w-[120px] flex-1 flex-col items-center rounded-md p-2 transition ${
                tieneDatos
                  ? "cursor-pointer hover:bg-slate-50"
                  : "cursor-default"
              }`}
            >
              <div
                className="flex w-full items-end justify-center gap-2"
                style={{ height: ALTURA_GRAFICO }}
              >
                <div className="flex flex-col items-center justify-end">
                  <span className="mb-1 whitespace-nowrap text-[11px] font-medium text-slate-700">
                    {dato.presupuesto > 0
                      ? formatearEuros(Math.round(dato.presupuesto))
                      : "—"}
                  </span>
                  <div
                    className="w-10 rounded-t-md bg-blue-500"
                    style={{ height: alturaPresupuesto }}
                  />
                </div>

                <div className="flex flex-col items-center justify-end">
                  <span className="mb-1 whitespace-nowrap text-[11px] font-medium text-slate-700">
                    {dato.gastado > 0
                      ? formatearEuros(Math.round(dato.gastado))
                      : "—"}
                  </span>
                  <div
                    className="w-10 rounded-t-md bg-amber-500"
                    style={{ height: alturaGastado }}
                  />
                </div>
              </div>

              <span className="mt-3 whitespace-nowrap text-sm font-medium text-slate-600">
                {etiquetaSemestre(dato.semestre)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-blue-500" />
          <span>Presupuesto (por fin de fase)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-amber-500" />
          <span>Gastado real</span>
        </div>
      </div>

      {semestreSeleccionado && (
        <ModalDesgloseSemestre
          datos={semestreSeleccionado}
          onCerrar={() => setSemestreSeleccionado(null)}
        />
      )}
    </article>
  );
}

function ModalDesgloseSemestre({
  datos,
  onCerrar,
}: {
  datos: DatosSemestre;
  onCerrar: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 py-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-sm text-slate-500">Desglose por proyecto</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {etiquetaSemestre(datos.semestre)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Proyecto</th>
                <th className="pb-2 text-right font-medium">Presupuesto</th>
                <th className="pb-2 text-right font-medium">Gastado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datos.contribuciones.map((c) => (
                <tr key={c.proyecto.id}>
                  <td className="py-2 pr-4">
                    <div className="font-medium text-slate-900">
                      {c.proyecto.nombre}
                    </div>
                    <div className="text-xs text-slate-500">
                      {c.proyecto.codigo}
                    </div>
                  </td>
                  <td className="py-2 text-right text-slate-900">
                    {c.presupuesto > 0
                      ? formatearEuros(Math.round(c.presupuesto))
                      : "—"}
                  </td>
                  <td className="py-2 text-right text-slate-900">
                    {c.gastado > 0 ? formatearEuros(Math.round(c.gastado)) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-semibold">
                <td className="pt-3">Total</td>
                <td className="pt-3 text-right">
                  {formatearEuros(Math.round(datos.presupuesto))}
                </td>
                <td className="pt-3 text-right">
                  {formatearEuros(Math.round(datos.gastado))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
