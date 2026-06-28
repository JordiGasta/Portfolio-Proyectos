import type { EstadoProyecto } from "@/types/proyecto";

interface EstadoSaludDotProps {
  estado: EstadoProyecto;
}

const colores: Record<EstadoProyecto, string> = {
  "En curso": "bg-emerald-500",
  "En riesgo": "bg-amber-500",
  "Fuera de control": "bg-rose-500",
  "En pausa": "bg-slate-400",
  Cancelado: "bg-slate-600",
};

export default function EstadoSaludDot({ estado }: EstadoSaludDotProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${colores[estado]}`} />
      <span className="text-sm text-slate-700">{estado}</span>
    </span>
  );
}
