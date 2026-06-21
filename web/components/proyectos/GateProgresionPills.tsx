import type { Proyecto } from "@/types/proyecto";
import { calcularProgresionGates } from "@/lib/proyectos/calculos";

const estilos: Record<string, string> = {
  superado: "bg-emerald-500 text-white",
  actual: "bg-amber-500 text-white",
  pendiente: "bg-slate-200 text-slate-500",
};

interface GateProgresionPillsProps {
  proyecto: Proyecto;
}

export default function GateProgresionPills({
  proyecto,
}: GateProgresionPillsProps) {
  const progresion = calcularProgresionGates(proyecto);

  return (
    <div className="flex flex-wrap gap-2">
      {progresion.map((item) => (
        <span
          key={item.gate}
          title={item.estado}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${estilos[item.estado]}`}
        >
          {item.gate}
        </span>
      ))}
    </div>
  );
}
