"use client";

import { useState } from "react";
import type { Proyecto } from "@/types/proyecto";
import DetalleProyectoModal from "@/components/proyectos/DetalleProyectoModal";
import CategoriaBadge from "@/components/proyectos/CategoriaBadge";
import { esProyectoZombie, obtenerProximoGate } from "@/lib/proyectos/calculos";
import { formatearFecha } from "@/lib/format/formato";

interface TablaGatesProps {
  titulo: string;
  colorTitulo: "rojo" | "slate";
  proyectos: Proyecto[];
  etiquetaFecha: string;
  colorFecha: "rojo" | "slate";
  mensajeVacio: string;
}

export default function TablaGates({
  titulo,
  colorTitulo,
  proyectos,
  etiquetaFecha,
  colorFecha,
  mensajeVacio,
}: TablaGatesProps) {
  const [proyectoSeleccionado, setProyectoSeleccionado] =
    useState<Proyecto | null>(null);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3
          className={`text-lg font-semibold ${
            colorTitulo === "rojo" ? "text-rose-600" : "text-slate-900"
          }`}
        >
          {titulo}
        </h3>
      </div>

      {proyectos.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">{mensajeVacio}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Proyecto</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Gate</th>
                <th className="px-5 py-3 font-medium">Fase</th>
                <th className="px-5 py-3 font-medium">Sponsor</th>
                <th className="px-5 py-3 font-medium">Project Manager</th>
                <th className="px-5 py-3 font-medium">{etiquetaFecha}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {proyectos.map((proyecto) => {
                const proximoGate = obtenerProximoGate(proyecto);
                const esZombie = esProyectoZombie(proyecto);

                return (
                  <tr
                    key={proyecto.id}
                    onClick={() => setProyectoSeleccionado(proyecto)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <td className="max-w-[220px] px-5 py-3 font-medium">
                      <div className="truncate" title={proyecto.nombre}>
                        {proyecto.nombre}
                      </div>
                      {esZombie && (
                        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          Sin avance de gate en más de 90 días
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <CategoriaBadge categoria={proyecto.categoria} />
                    </td>
                    <td className="px-5 py-3">{proximoGate ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {proyecto.fase}
                    </td>
                    <td className="px-5 py-3">{proyecto.sponsor}</td>
                    <td className="px-5 py-3">{proyecto.responsable}</td>
                    <td
                      className={`px-5 py-3 font-medium ${
                        colorFecha === "rojo"
                          ? "text-rose-600"
                          : "text-slate-700"
                      }`}
                    >
                      {proyecto.fechaProximoGate
                        ? formatearFecha(proyecto.fechaProximoGate)
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {proyectoSeleccionado && (
        <DetalleProyectoModal
          proyecto={proyectoSeleccionado}
          onCerrar={() => setProyectoSeleccionado(null)}
        />
      )}
    </article>
  );
}
