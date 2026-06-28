"use client";

import type {
  CategoriaProyecto,
  EstadoProyecto,
  FaseProyecto,
} from "@/types/proyecto";
import { ordenCategorias, ordenEstadosProyecto, ordenFases } from "@/lib/proyectos/calculos";

export interface FiltrosProyectosValor {
  fase: FaseProyecto | "Todas";
  categoria: CategoriaProyecto | "Todas";
  estado: EstadoProyecto | "Todos";
}

interface FiltrosProyectosProps {
  valor: FiltrosProyectosValor;
  onCambiar: (valor: FiltrosProyectosValor) => void;
}

export default function FiltrosProyectos({
  valor,
  onCambiar,
}: FiltrosProyectosProps) {
  return (
    <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
      <div>
        <label className="block text-xs font-medium text-slate-500">Fase</label>
        <select
          value={valor.fase}
          onChange={(evento) =>
            onCambiar({
              ...valor,
              fase: evento.target.value as FiltrosProyectosValor["fase"],
            })
          }
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        >
          <option value="Todas">Todas</option>
          {ordenFases.map((fase) => (
            <option key={fase} value={fase}>
              {fase}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500">Tipo</label>
        <select
          value={valor.categoria}
          onChange={(evento) =>
            onCambiar({
              ...valor,
              categoria: evento.target.value as FiltrosProyectosValor["categoria"],
            })
          }
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        >
          <option value="Todas">Todos</option>
          {ordenCategorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500">Estado</label>
        <select
          value={valor.estado}
          onChange={(evento) =>
            onCambiar({
              ...valor,
              estado: evento.target.value as FiltrosProyectosValor["estado"],
            })
          }
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        >
          <option value="Todos">Todos</option>
          {ordenEstadosProyecto.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
