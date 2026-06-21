import type { EstadoProyecto } from "@/types/proyecto";

interface EstadoBadgeProps {
  estado: EstadoProyecto;
}

const estilosPorEstado: Record<EstadoProyecto, string> = {
  Propuesta: "bg-slate-100 text-slate-700",
  "En estudio": "bg-sky-100 text-sky-700",
  Aprobado: "bg-indigo-100 text-indigo-700",
  "En ejecución": "bg-emerald-100 text-emerald-700",
  "En pausa": "bg-amber-100 text-amber-700",
  Finalizado: "bg-slate-200 text-slate-600",
  Cancelado: "bg-rose-100 text-rose-700",
};

export default function EstadoBadge({ estado }: EstadoBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${estilosPorEstado[estado]}`}
    >
      {estado}
    </span>
  );
}