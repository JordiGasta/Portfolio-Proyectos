import Link from "next/link";
import type { Proyecto } from "@/types/proyecto";
import {
  calcularDemandaPorTrimestre,
  etiquetaTrimestre,
  generarTrimestres,
} from "@/lib/proyectos/capex";
import { ENVELOPE_CAPEX_ANUAL } from "@/lib/configuracion";
import { formatearEuros } from "@/lib/format/formato";

interface CapexDemandResumenProps {
  proyectos: Proyecto[];
}

export default function CapexDemandResumen({
  proyectos,
}: CapexDemandResumenProps) {
  const trimestres = generarTrimestres(8);
  const demanda = calcularDemandaPorTrimestre(proyectos, trimestres);
  const techo = ENVELOPE_CAPEX_ANUAL / 4;
  const maximo = Math.max(techo, ...demanda.map((item) => item.total));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          Demanda CAPEX
        </h3>
        <Link
          href="/demanda-capex"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Ver completo →
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {demanda.map((item) => {
          const anchoPorcentaje = (item.total / maximo) * 100;
          const superaTecho = item.total > techo;

          return (
            <div
              key={etiquetaTrimestre(item.trimestre)}
              className="flex items-center gap-3"
            >
              <span className="w-16 text-xs text-slate-500">
                {etiquetaTrimestre(item.trimestre)}
              </span>
              <div className="relative h-3 flex-1 rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    superaTecho ? "bg-rose-500" : "bg-slate-700"
                  }`}
                  style={{ width: `${Math.min(100, anchoPorcentaje)}%` }}
                />
              </div>
              <span
                className={`w-24 text-right text-xs ${
                  superaTecho ? "font-semibold text-rose-600" : "text-slate-600"
                }`}
              >
                {formatearEuros(Math.round(item.total))}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Techo trimestral: {formatearEuros(Math.round(techo))}
      </p>
    </article>
  );
}
