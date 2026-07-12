import type { ReactNode } from "react";

interface DatoFichaProps {
  etiqueta: string;
  valor: ReactNode;
}

export default function DatoFicha({ etiqueta, valor }: DatoFichaProps) {
  return (
    <div>
      <p className="text-xs text-slate-500">{etiqueta}</p>
      <div className="mt-1 text-base font-medium text-slate-900">{valor}</div>
    </div>
  );
}
