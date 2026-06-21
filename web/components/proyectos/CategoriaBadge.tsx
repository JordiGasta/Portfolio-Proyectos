import type { CategoriaProyecto } from "@/types/proyecto";

interface CategoriaBadgeProps {
  categoria: CategoriaProyecto;
}

const estilos: Record<CategoriaProyecto, string> = {
  "Creación de valor": "bg-blue-100 text-blue-700",
  "Protección de valor": "bg-amber-100 text-amber-700",
  Obligatorio: "bg-slate-200 text-slate-700",
};

export default function CategoriaBadge({ categoria }: CategoriaBadgeProps) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${estilos[categoria]}`}
    >
      {categoria}
    </span>
  );
}
