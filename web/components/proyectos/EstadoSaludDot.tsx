import type { EstadoSalud } from "@/types/proyecto";

interface EstadoSaludDotProps {
  estadoSalud: EstadoSalud;
}

const colores: Record<EstadoSalud, string> = {
  "En curso": "bg-emerald-500",
  "En riesgo": "bg-amber-500",
  "Fuera de control": "bg-rose-500",
};

export default function EstadoSaludDot({ estadoSalud }: EstadoSaludDotProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${colores[estadoSalud]}`} />
      <span className="text-sm text-slate-700">{estadoSalud}</span>
    </span>
  );
}
