interface ElementoDistribucion {
  etiqueta: string;
  cantidad: number;
}

interface DistribucionListaProps {
  titulo: string;
  elementos: ElementoDistribucion[];
}

export default function DistribucionLista({
  titulo,
  elementos,
}: DistribucionListaProps) {
  const total = elementos.reduce(
    (suma, elemento) => suma + elemento.cantidad,
    0,
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>

      <ul className="mt-4 space-y-3">
        {elementos.map((elemento) => {
          const porcentaje =
            total > 0 ? Math.round((elemento.cantidad / total) * 100) : 0;

          return (
            <li key={elemento.etiqueta}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{elemento.etiqueta}</span>
                <span className="font-medium text-slate-900">
                  {elemento.cantidad}
                </span>
              </div>

              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-slate-700"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}