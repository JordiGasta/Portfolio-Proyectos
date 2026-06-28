"use client";

import type { Proyecto } from "@/types/proyecto";
import CategoriaBadge from "@/components/proyectos/CategoriaBadge";
import FaseBadge from "@/components/proyectos/FaseBadge";
import EstadoSaludDot from "@/components/proyectos/EstadoSaludDot";
import VariacionBadge from "@/components/proyectos/VariacionBadge";
import {
  calcularEAC,
  calcularVariacionPorcentual,
  obtenerProximoGate,
  tieneGateVencido,
} from "@/lib/proyectos/calculos";
import { formatearEuros, formatearFecha } from "@/lib/format/formato";

interface FilaProyectoProps {
  proyecto: Proyecto;
  onSeleccionar: (proyecto: Proyecto) => void;
}

export default function FilaProyecto({
  proyecto,
  onSeleccionar,
}: FilaProyectoProps) {
  const eac = calcularEAC(proyecto);
  const variacion = calcularVariacionPorcentual(proyecto);
  const proximoGate = obtenerProximoGate(proyecto);
  const vencido = tieneGateVencido(proyecto);

  return (
    <tr
      onClick={() => onSeleccionar(proyecto)}
      className="cursor-pointer hover:bg-slate-50"
    >
      <td className="max-w-[220px] truncate px-5 py-4 font-medium" title={proyecto.nombre}>
        {proyecto.nombre}
      </td>
      <td className="px-5 py-4">
        <CategoriaBadge categoria={proyecto.categoria} />
      </td>
      <td className="px-5 py-4">
        <FaseBadge fase={proyecto.fase} />
      </td>
      <td className="px-5 py-4">
        <EstadoSaludDot estado={proyecto.estado} />
      </td>
      <td
        className={`px-5 py-4 text-sm ${
          vencido ? "font-semibold text-rose-600" : "text-slate-700"
        }`}
      >
        {proximoGate ?? "—"}
        {proyecto.fechaProximoGate ? ` · ${formatearFecha(proyecto.fechaProximoGate)}` : ""}
      </td>
      <td className="px-5 py-4">{formatearEuros(proyecto.presupuestoAprobado)}</td>
      <td className="px-5 py-4">{formatearEuros(proyecto.importeGastado)}</td>
      <td className="px-5 py-4">{formatearEuros(eac)}</td>
      <td className="px-5 py-4">
        <VariacionBadge porcentaje={variacion} />
      </td>
      <td className="px-5 py-4 text-slate-400">→</td>
    </tr>
  );
}
