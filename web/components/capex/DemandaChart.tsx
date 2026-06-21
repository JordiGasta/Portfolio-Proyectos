import type { Proyecto } from "@/types/proyecto";
import {
  calcularContribucionesPorTrimestre,
  calcularDemandaPorTrimestrePorCategoria,
  etiquetaTrimestre,
  generarTrimestres,
} from "@/lib/proyectos/capex";
import { ENVELOPE_CAPEX_ANUAL } from "@/lib/configuracion";
import { formatearEuros } from "@/lib/format/formato";

const coloresPorCategoria: Record<string, string> = {
  "Creación de valor": "bg-blue-500",
  "Protección de valor": "bg-amber-500",
  Obligatorio: "bg-slate-500",
};

interface DemandaChartProps {
  proyectos: Proyecto[];
}

export default function DemandaChart({ proyectos }: DemandaChartProps) {
  const trimestres = generarTrimestres(8);
  const demanda = calcularDemandaPorTrimestrePorCategoria(
    proyectos,
    trimestres,
  );
  const contribucionesPorTrimestre = calcularContribucionesPorTrimestre(
    proyectos,
    trimestres,
  );
  const techo = ENVELOPE_CAPEX_ANUAL / 4;
  const maximo = Math.max(techo, ...demanda.map((item) => item.total)) * 1.15;
  const posicionTecho = Math.min(100, (techo / maximo) * 100);

  const trimestresExcedidos = demanda.filter((item) => item.total > techo);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">
          Demanda CAPEX trimestral
        </h3>
        <p className="text-xs text-slate-400">
          Techo trimestral: {formatearEuros(Math.round(techo))}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {demanda.map((item, indice) => {
          const superaTecho = item.total > techo;
          const categorias: string[] = Object.keys(item.porCategoria);
          const contribuciones =
            contribucionesPorTrimestre[indice]?.contribuciones ?? [];

          const tooltipTexto =
            contribuciones.length > 0
              ? contribuciones
                  .map(
                    (contribucion) =>
                      `${contribucion.proyecto.nombre}: ${formatearEuros(
                        Math.round(contribucion.monto),
                      )}`,
                  )
                  .join("\n")
              : "Sin proyectos en este trimestre";

          return (
            <div key={etiquetaTrimestre(item.trimestre)}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  {etiquetaTrimestre(item.trimestre)}
                </span>
                <span
                  className={
                    superaTecho
                      ? "font-semibold text-rose-600"
                      : "text-slate-600"
                  }
                >
                  {formatearEuros(Math.round(item.total))}
                  {superaTecho &&
                    ` (+${formatearEuros(Math.round(item.total - techo))})`}
                </span>
              </div>

              <div
                title={tooltipTexto}
                className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100"
              >
                <div className="flex h-full w-full">
                  {categorias.map((categoria) => {
                    const valor =
                      item.porCategoria[
                        categoria as keyof typeof item.porCategoria
                      ];
                    if (valor <= 0) {
                      return null;
                    }

                    return (
                      <div
                        key={categoria}
                        className={coloresPorCategoria[categoria]}
                        style={{ width: `${(valor / maximo) * 100}%` }}
                      />
                    );
                  })}
                </div>

                <div
                  className="absolute top-0 h-full w-0.5 bg-rose-500"
                  style={{ left: `${posicionTecho}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-slate-600">
        <LeyendaItem color="bg-blue-500" etiqueta="Creación de valor" />
        <LeyendaItem color="bg-amber-500" etiqueta="Protección de valor" />
        <LeyendaItem color="bg-slate-500" etiqueta="Obligatorio" />
        <div className="flex items-center gap-2">
          <span className="h-3 w-0.5 bg-rose-500" />
          <span>Techo trimestral</span>
        </div>
      </div>

      {trimestresExcedidos.length > 0 && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-medium">
            Techo trimestral superado en{" "}
            {trimestresExcedidos.length === 1
              ? "1 trimestre"
              : `${trimestresExcedidos.length} trimestres`}
            :
          </p>
          <p className="mt-1">
            {trimestresExcedidos
              .map((item) => etiquetaTrimestre(item.trimestre))
              .join(", ")}
          </p>
        </div>
      )}
    </article>
  );
}

function LeyendaItem({ color, etiqueta }: { color: string; etiqueta: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      <span>{etiqueta}</span>
    </div>
  );
}
