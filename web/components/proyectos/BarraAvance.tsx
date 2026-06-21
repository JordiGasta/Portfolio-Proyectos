interface BarraAvanceProps {
  porcentaje: number;
}

export default function BarraAvance({ porcentaje }: BarraAvanceProps) {
  const valor = Math.min(100, Math.max(0, porcentaje));

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-slate-700" style={{ width: `${valor}%` }} />
      </div>

      <span className="text-sm text-slate-700">{valor} %</span>
    </div>
  );
}