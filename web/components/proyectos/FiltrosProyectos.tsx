"use client";

import type { Departamento, EstadoProyecto, FaseProyecto } from "@/types/proyecto";

const estados: EstadoProyecto[] = [
  "Propuesta",
  "En estudio",
  "Aprobado",
  "En ejecución",
  "En pausa",
  "Finalizado",
  "Cancelado",
];

const fases: FaseProyecto[] = [
  "Fase 0 — Fase previa",
  "Fase I — Project Charter",
  "Fase IIA — Análisis de escenarios",
  "Fase IIB — Ingeniería básica solución escogida",
  "Fase III — Ingeniería de detalle",
  "Fase IV — Ejecución",
  "Fase V — Cierre",
];

const departamentos: Departamento[] = [
  "Producción",
  "Mantenimiento",
  "Ingeniería",
  "Calidad",
  "Logística",
  "Medio Ambiente",
  "Dirección",
];

export interface FiltrosProyectosValor {
  texto: string;
  estado: EstadoProyecto | "Todos";
  fase: FaseProyecto | "Todas";
  departamento: Departamento | "Todos";
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
    <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label
          htmlFor="filtro-texto"
          className="block text-xs font-medium text-slate-500"
        >
          Buscar
        </label>
        <input
          id="filtro-texto"
          type="text"
          placeholder="Código o nombre del proyecto"
          value={valor.texto}
          onChange={(evento) =>
            onCambiar({ ...valor, texto: evento.target.value })
          }
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="filtro-estado"
          className="block text-xs font-medium text-slate-500"
        >
          Estado
        </label>
        <select
          id="filtro-estado"
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
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="filtro-fase"
          className="block text-xs font-medium text-slate-500"
        >
          Fase
        </label>
        <select
          id="filtro-fase"
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
          {fases.map((fase) => (
            <option key={fase} value={fase}>
              {fase}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="filtro-departamento"
          className="block text-xs font-medium text-slate-500"
        >
          Departamento
        </label>
        <select
          id="filtro-departamento"
          value={valor.departamento}
          onChange={(evento) =>
            onCambiar({
              ...valor,
              departamento: evento.target
                .value as FiltrosProyectosValor["departamento"],
            })
          }
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        >
          <option value="Todos">Todos</option>
          {departamentos.map((departamento) => (
            <option key={departamento} value={departamento}>
              {departamento}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}