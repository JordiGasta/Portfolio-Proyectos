"use client";

import { useState } from "react";
import type { FaseProyecto, Proyecto } from "@/types/proyecto";
import DetalleProyectoModal from "@/components/proyectos/DetalleProyectoModal";
import {
  calcularPosicionHoyMensual,
  calcularTramosPorFase,
  generarMeses,
} from "@/lib/proyectos/cronograma";

const coloresPorFase: Record<FaseProyecto, string> = {
  "Fase 0 — Fase previa": "bg-slate-400",
  "Fase I — Inicio / Project Charter": "bg-sky-500",
  "Fase IIA — Análisis de escenarios": "bg-indigo-500",
  "Fase IIB — Ingeniería básica solución escogida": "bg-violet-500",
  "Fase III — Ingeniería de detalle": "bg-fuchsia-500",
  "Fase IV — Ejecución": "bg-amber-500",
  "Fase V — Cierre": "bg-emerald-500",
  "N/A": "bg-gray-300",
};

const ordenLeyenda: FaseProyecto[] = [
  "Fase 0 — Fase previa",
  "Fase I — Inicio / Project Charter",
  "Fase IIA — Análisis de escenarios",
  "Fase IIB — Ingeniería básica solución escogida",
  "Fase III — Ingeniería de detalle",
  "Fase IV — Ejecución",
  "Fase V — Cierre",
];

interface GanttChartProps {
  proyectos: Proyecto[];
  anio: number;
}

export default function GanttChart({ proyectos, anio }: GanttChartProps) {
  const [proyectoSeleccionado, setProyectoSeleccionado] =
    useState<Proyecto | null>(null);
  const meses = generarMeses(anio);
  const posicionHoy = calcularPosicionHoyMensual(anio);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-[1100px]">
        <div className="flex border-b border-slate-200">
          <div className="w-[220px] shrink-0 border-r border-slate-200 p-3 text-xs font-medium text-slate-500">
            Proyecto
          </div>
          <div className="flex flex-1">
            {meses.map((mes) => (
              <div
                key={mes.etiqueta}
                className="flex-1 border-r border-slate-100 p-3 text-center text-xs font-medium text-slate-500 last:border-r-0"
              >
                {mes.etiqueta}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {posicionHoy !== null && (
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-rose-400"
              style={{ left: `calc(220px + ${(posicionHoy / 12) * 100}%)` }}
            />
          )}

          {proyectos
            .filter((proyecto) => proyecto.estado !== "En estudio")
            .map((proyecto) => {
            const tramos = calcularTramosPorFase(proyecto, anio);

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

                <div className="relative flex-1 overflow-hidden" style={{ height: "40px" }}>
                  {tramos.length > 0 ? (
                    <div className="relative h-10" style={{ height: "40px" }}>
                      {/* Líneas de fondo de cada mes, solo para referencia visual */}
                      <div className="absolute inset-0 flex">
                        {meses.map((mes) => (
                          <div
                            key={mes.etiqueta}
                            className="flex-1 border-r border-slate-50 last:border-r-0"
                          />
                        ))}
                      </div>

                      {tramos.map(({ fase, posicion }) => (
                        <button
                          key={fase}
                          type="button"
                          onClick={() => setProyectoSeleccionado(proyecto)}
                          title={`${proyecto.nombre} — ${fase}`}
                          className={`absolute top-2 bottom-2 rounded-md ${coloresPorFase[fase]}`}
                          style={{
                            left: `${(posicion.inicio / 12) * 100}%`,
                            width: `${(posicion.ancho / 12) * 100}%`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-10 items-center truncate px-3 text-xs text-slate-400">
                      (Sin fases dentro de {anio})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 p-4 text-xs text-slate-600">
        {ordenLeyenda.map((fase) => (
          <LeyendaItem
            key={fase}
            color={coloresPorFase[fase]}
            etiqueta={fase.split("—")[0].trim()}
          />
        ))}
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
