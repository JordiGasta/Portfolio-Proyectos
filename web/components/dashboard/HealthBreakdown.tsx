import type { Proyecto } from "@/types/proyecto";
import { contarPorSalud } from "@/lib/proyectos/calculos";

const estilos: Record<string, string> = {
  "En curso": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "En riesgo": "bg-amber-50 text-amber-700 border-amber-200",
  "Fuera de control": "bg-rose-50 text-rose-700 border-rose-200",
};

interface HealthBreakdownProps {
  proyectos: Proyecto[];
}

export default function HealthBreakdown({ proyectos }: HealthBreakdownProps) {
  const conteo = contarPorSalud(proyectos);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">
        Salud del portfolio
      </h3>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {conteo.map((item) => (
          <div
            key={item.estadoSalud}
            className={`rounded-lg border p-4 text-center ${estilos[item.estadoSalud]}`}
          >
            <p className="text-2xl font-bold">{item.cantidad}</p>
            <p className="mt-1 text-xs font-medium">{item.estadoSalud}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
