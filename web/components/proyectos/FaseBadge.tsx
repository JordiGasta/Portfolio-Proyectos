import type { FaseProyecto } from "@/types/proyecto";
import { obtenerCodigoFaseCorto } from "@/lib/format/formato";

interface FaseBadgeProps {
  fase: FaseProyecto;
}

export default function FaseBadge({ fase }: FaseBadgeProps) {
  return (
    <span
      title={fase}
      className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
    >
      {obtenerCodigoFaseCorto(fase)}
    </span>
  );
}
