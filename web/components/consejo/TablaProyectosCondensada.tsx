"use client";

import { useState } from "react";
import type { Proyecto } from "@/types/proyecto";
import CategoriaBadge from "@/components/proyectos/CategoriaBadge";
import FaseBadge from "@/components/proyectos/FaseBadge";
import EstadoSaludDot from "@/components/proyectos/EstadoSaludDot";
import VariacionBadge from "@/components/proyectos/VariacionBadge";
import DetalleProyectoModal from "@/components/proyectos/DetalleProyectoModal";
import { calcularEAC, calcularVariacionPorcentual } from "@/lib/proyectos/calculos";
import { formatearEuros, formatearFecha } from "@/lib/format/formato";

interface TablaProyectosCondensadaProps {
  proyectos: Proyecto[];
}

export default function TablaProyectosCondensada({ proyectos }: TablaProyectosCondensadaProps) {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-base font-semibold text-slate-900">Proyectos activos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Proyecto</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Fase</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Presupuesto</th>
              <th className="px-5 py-3 font-medium">EAC</th>
              <th className="px-5 py-3 font-medium">Variación</th>
              <th className="px-5 py-3 font-medium">Fecha fin prevista</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {proyectos.map((proyecto) => {
              const eac = calcularEAC(proyecto);
              const variacion = calcularVariacionPorcentual(proyecto);
              return (
                <tr key={proyecto.id} onClick={() => setProyectoSeleccionado(proyecto)} className="cursor-pointer hover:bg-slate-50">
                  <td className="max-w-[220px] truncate px-5 py-3 font-medium" title={proyecto.nombre}>{proyecto.nombre}</td>
                  <td className="px-5 py-3"><CategoriaBadge categoria={proyecto.categoria} /></td>
                  <td className="px-5 py-3"><FaseBadge fase={proyecto.fase} /></td>
                  <td className="px-5 py-3"><EstadoSaludDot estado={proyecto.estado} /></td>
                  <td className="px-5 py-3">{formatearEuros(proyecto.presupuestoAprobado)}</td>
                  <td className="px-5 py-3">{formatearEuros(eac)}</td>
                  <td className="px-5 py-3"><VariacionBadge porcentaje={variacion} /></td>
                  <td className="px-5 py-3">{formatearFecha(proyecto.fechaFinPrevista)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {proyectoSeleccionado && (
        <DetalleProyectoModal proyecto={proyectoSeleccionado} onCerrar={() => setProyectoSeleccionado(null)} />
      )}
    </article>
  );
}
