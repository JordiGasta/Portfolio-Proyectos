interface IndicadorCardProps {
  etiqueta: string;
  valor: string | number;
  destacado?: boolean;
}

export default function IndicadorCard({
  etiqueta,
  valor,
  destacado = false,
}: IndicadorCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <p
        className={
          destacado
            ? "mt-2 text-3xl font-bold text-amber-600"
            : "mt-2 text-2xl font-bold text-slate-900"
        }
      >
        {valor}
      </p>
    </article>
  );
}