"use client";

import { useState } from "react";
import type { Proyecto } from "@/types/proyecto";
import DetalleProyectoModal from "@/components/proyectos/DetalleProyectoModal";
import { etiquetaTrimestre, generarTrimestres } from "@/lib/proyectos/capex";
import {
  calcularPosicionBarra,
  calcularPosicionHoy,
} from "@/lib/proyectos/cronograma";

const coloresPorCategoria: Record<string, string> = {
  "Creación de valor": "bg-blue-500/70",
  "Protección de valor": "bg-amber-500/70",
  Obligatorio: "bg-slate-500/70",
};

interface GanttChartProps {
  proyectos: Proyecto[];
}

export default function GanttChart({ proyectos }: GanttChartProps) {
  const [proyectoSeleccionado, setProyectoSeleccionado] =
    useState<Proyecto | null>(null);
  const trimestres = generarTrimestres(8);
  const posicionHoy = calcularPosicionHoy(trimestres);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-[1100px]">
        <div className="flex border-b border-slate-200">
          <div className="w-[220px] shrink-0 border-r border-slate-200 p-3 text-xs font-medium text-slate-500">
            Proyecto
          </div>
          <div className="flex flex-1">
            {trimestres.map((trimestre) => (
              <div
                key={etiquetaTrimestre(trimestre)}
                className="flex-1 border-r border-slate-100 p-3 text-center text-xs font-medium text-slate-500 last:border-r-0"
              >
                {etiquetaTrimestre(trimestre)}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-rose-400"
            style={{ left: `calc(220px + ${(posicionHoy / 8) * 100}%)` }}
          />

          {proyectos.map((proyecto) => {
            const detalleEjecucion =
              proyecto.detallePorFase["Fase IV — Ejecución"];
            const tieneFechas = Boolean(
              detalleEjecucion?.fechaInicio && detalleEjecucion?.fechaFin,
            );
            const posicion =
              tieneFechas && detalleEjecucion
                ? calcularPosicionBarra(
                    detalleEjecucion.fechaInicio as string,
                    detalleEjecucion.fechaFin as string,
                    trimestres,
                  )
                : null;

            return (
              <div
                key={proyecto.id}
                className="flex border-b border-slate-100 last:border-b-0"
              >
                <div className="w-[220px] shrink-0 overflow-hidden border-r border-slate-200 p-3">
                  <button
                    type="button"
                    onClick={() => setProyectoSeleccionado(proyecto)}
                    title={proyecto.nombre}
                    className="block w-full truncate text-left text-sm text-slate-700 hover:underline"
                  >
                    {proyecto.nombre}
                  </button>
                </div>

                <div className="relative flex flex-1 items-center overflow-hidden">
                  <div className="grid h-10 w-full grid-cols-8">
                    {posicion ? (
                      <button
                        type="button"
                        onClick={() => setProyectoSeleccionado(proyecto)}
                        title={proyecto.nombre}
                        className={`my-2 rounded-md ${coloresPorCategoria[proyecto.categoria]}`}
                        style={{
                          gridColumnStart: posicion.inicio + 1,
                          gridColumnEnd: posicion.inicio + 1 + posicion.ancho,
                        }}
                      />
                    ) : (
                      <div className="col-span-8 flex items-center truncate px-3 text-xs text-slate-400">
                        (Fecha de ejecución pendiente)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 border-t border-slate-200 p-4 text-xs text-slate-600">
        <LeyendaItem color="bg-blue-500/70" etiqueta="Creación de valor" />
        <LeyendaItem color="bg-amber-500/70" etiqueta="Protección de valor" />
        <LeyendaItem color="bg-slate-500/70" etiqueta="Obligatorio" />
        <div className="flex items-center gap-2">
          <span className="h-4 w-px bg-rose-400" />
          <span>Hoy</span>
        </div>
      </div>

      {proyectoSeleccionado && (
        <DetalleProyectoModal
          proyecto={proyectoSeleccionado}
          onCerrar={() => setProyectoSeleccionado(null)}
        />
      )}
    </div>
  );
}

function LeyendaItem({ color, etiqueta }: { color: string; etiqueta: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      <span>{etiqueta}</span>
    </div>
  );
}
