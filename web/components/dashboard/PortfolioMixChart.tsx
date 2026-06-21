import type { Proyecto } from "@/types/proyecto";
import { contarActivosPorCategoria } from "@/lib/proyectos/calculos";

const colores: Record<string, string> = {
  "Creación de valor": "bg-blue-600",
  "Protección de valor": "bg-amber-500",
  Obligatorio: "bg-slate-500",
};

interface PortfolioMixChartProps {
  proyectos: Proyecto[];
}

export default function PortfolioMixChart({
  proyectos,
}: PortfolioMixChartProps) {
  const conteo = contarActivosPorCategoria(proyectos);
  const maximo = Math.max(1, ...conteo.map((item) => item.cantidad));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Portfolio mix</h3>

      <div className="mt-6 flex items-end gap-6">
        {conteo.map((item) => {
          const alturaPorcentaje = (item.cantidad / maximo) * 100;

          return (
            <div
              key={item.categoria}
              className="flex flex-1 flex-col items-center"
            >
              <span className="text-sm font-medium text-slate-900">
                {item.cantidad}
              </span>
              <div className="mt-1 flex h-28 w-full items-end rounded-md bg-slate-100">
                <div
                  className={`w-full rounded-md ${colores[item.categoria]}`}
                  style={{
                    height: `${item.cantidad === 0 ? 2 : alturaPorcentaje}%`,
                  }}
                />
              </div>
              <span className="mt-2 text-center text-xs text-slate-500">
                {item.categoria}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
