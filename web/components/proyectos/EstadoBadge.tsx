import type { EstadoProyecto } from "@/types/proyecto";

interface EstadoBadgeProps {
  estado: EstadoProyecto;
}

const estilosPorEstado: Record<EstadoProyecto, string> = {
  "En curso": "bg-emerald-100 text-emerald-700",
  "En riesgo": "bg-amber-100 text-amber-700",
  "Fuera de control": "bg-rose-100 text-rose-700",
  "En pausa": "bg-slate-100 text-slate-600",
  Cancelado: "bg-slate-200 text-slate-700",
  Terminado: "bg-sky-100 text-sky-700",
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
