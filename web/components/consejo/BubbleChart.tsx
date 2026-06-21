import { Fragment } from "react";
import type { Proyecto } from "@/types/proyecto";
import { formatearEuros } from "@/lib/format/formato";

const nivelesRiesgo: Array<"Bajo" | "Medio" | "Alto"> = [
  "Bajo",
  "Medio",
  "Alto",
];

const horizontes: Array<"Largo plazo" | "Medio plazo" | "Corto plazo"> = [
  "Largo plazo",
  "Medio plazo",
  "Corto plazo",
];

const coloresPorCategoria: Record<string, string> = {
  "Creación de valor": "bg-blue-500",
  "Protección de valor": "bg-amber-500",
  Obligatorio: "bg-slate-500",
};

interface BubbleChartProps {
  proyectos: Proyecto[];
}

function construirTooltipCelda(proyectosCelda: Proyecto[]): string {
  if (proyectosCelda.length === 0) {
    return "Sin proyectos en esta celda";
  }

  const totalCelda = proyectosCelda.reduce(
    (total, proyecto) => total + proyecto.presupuestoAprobado,
    0,
  );

  const lineas = proyectosCelda.map((proyecto) => {
    const porcentaje =
      totalCelda > 0
        ? Math.round((proyecto.presupuestoAprobado / totalCelda) * 100)
        : 0;
    return `${proyecto.nombre}: ${formatearEuros(proyecto.presupuestoAprobado)} (${porcentaje}%)`;
  });

  return [
    `Presupuesto total: ${formatearEuros(totalCelda)}`,
    "",
    ...lineas,
  ].join("\n");
}

export default function BubbleChart({ proyectos }: BubbleChartProps) {
  const maximoPresupuesto = Math.max(
    1,
    ...proyectos.map((proyecto) => proyecto.presupuestoAprobado),
  );

  const calcularTamano = (presupuesto: number) => {
    const minimo = 24;
    const maximoTamano = 64;
    return (
      minimo + (presupuesto / maximoPresupuesto) * (maximoTamano - minimo)
    );
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">
        Balance del portfolio
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        Riesgo (horizontal) frente a horizonte temporal (vertical). El
        tamaño de cada círculo representa el presupuesto aprobado. Pasa el
        ratón por encima para ver el detalle de cada celda.
      </p>

      <div className="mt-6 grid grid-cols-[110px_1fr_1fr_1fr] gap-1">
        <div />
        {nivelesRiesgo.map((nivel) => (
          <div
            key={nivel}
            className="pb-2 text-center text-xs font-medium text-slate-500"
          >
            {nivel}
          </div>
        ))}

        {horizontes.map((horizonte) => (
          <Fragment key={horizonte}>
            <div className="flex items-center pr-2 text-xs font-medium text-slate-500">
              {horizonte}
            </div>
            {nivelesRiesgo.map((nivel) => {
              const proyectosCelda = proyectos.filter(
                (proyecto) =>
                  proyecto.nivelRiesgo === nivel &&
                  proyecto.horizonteTemporal === horizonte,
              );
              const tooltipCelda = construirTooltipCelda(proyectosCelda);

              return (
                <div
                  key={`${horizonte}-${nivel}`}
                  title={tooltipCelda}
                  className="flex min-h-[88px] flex-wrap items-center justify-center gap-1 rounded-md border border-slate-100 bg-slate-50 p-2"
                >
                  {proyectosCelda.map((proyecto) => {
                    const tamano = calcularTamano(
                      proyecto.presupuestoAprobado,
                    );

                    return (
                      <span
                        key={proyecto.id}
                        className={`rounded-full opacity-80 ${coloresPorCategoria[proyecto.categoria]}`}
                        style={{ width: tamano, height: tamano }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <LeyendaItem color="bg-blue-500" etiqueta="Creación de valor" />
        <LeyendaItem color="bg-amber-500" etiqueta="Protección de valor" />
        <LeyendaItem color="bg-slate-500" etiqueta="Obligatorio" />
      </div>
    </article>
  );
}

function LeyendaItem({ color, etiqueta }: { color: string; etiqueta: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{etiqueta}</span>
    </div>
  );
}
