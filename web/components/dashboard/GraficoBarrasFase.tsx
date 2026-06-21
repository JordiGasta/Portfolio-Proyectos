interface ElementoGrafico {
  etiqueta: string;
  cantidad: number;
}

interface GraficoBarrasFaseProps {
  titulo: string;
  elementos: ElementoGrafico[];
}

/**
 * Extrae la parte corta de una etiqueta de fase para usarla como
 * etiqueta del eje (ej. "Fase IIB — Ingeniería básica..." -> "Fase IIB").
 */
function obtenerEtiquetaCorta(etiqueta: string): string {
  return etiqueta.split("—")[0].trim();
}

/**
 * Gráfico de barras verticales hecho con HTML/CSS (sin librerías de
 * gráficos externas), usado para mostrar la distribución de proyectos
 * por fase en el dashboard.
 */
export default function GraficoBarrasFase({
  titulo,
  elementos,
}: GraficoBarrasFaseProps) {
  const maximo = Math.max(1, ...elementos.map((elemento) => elemento.cantidad));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>

      <div className="mt-6 flex items-end gap-3 overflow-x-auto pb-2">
        {elementos.map((elemento) => {
          const alturaPorcentaje = (elemento.cantidad / maximo) * 100;

          return (
            <div
              key={elemento.etiqueta}
              title={elemento.etiqueta}
              className="flex min-w-[56px] flex-1 flex-col items-center"
            >
              <span className="text-sm font-medium text-slate-900">
                {elemento.cantidad}
              </span>

              <div className="mt-1 flex h-32 w-full items-end rounded-md bg-slate-100">
                <div
                  className="w-full rounded-md bg-slate-700"
                  style={{
                    height: `${elemento.cantidad === 0 ? 2 : alturaPorcentaje}%`,
                  }}
                />
              </div>

              <span className="mt-2 text-center text-xs text-slate-500">
                {obtenerEtiquetaCorta(elemento.etiqueta)}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}