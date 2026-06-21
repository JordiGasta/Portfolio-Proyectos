interface IndicadorCardProps {
  etiqueta: string;
  valor: string | number;
  subEtiqueta?: string;
  colorSubEtiqueta?: "rojo" | "verde" | "neutro";
}

const coloresSubEtiqueta: Record<string, string> = {
  rojo: "text-rose-600",
  verde: "text-emerald-600",
  neutro: "text-slate-500",
};

export default function IndicadorCard({
  etiqueta,
  valor,
  subEtiqueta,
  colorSubEtiqueta = "neutro",
}: IndicadorCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{valor}</p>
      {subEtiqueta && (
        <p
          className={`mt-1 text-xs font-medium ${coloresSubEtiqueta[colorSubEtiqueta]}`}
        >
          {subEtiqueta}
        </p>
      )}
    </article>
  );
}
