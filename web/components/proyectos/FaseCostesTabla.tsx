import type { Proyecto } from "@/types/proyecto";
import { ordenFases } from "@/lib/proyectos/calculos";
import { formatearEuros, formatearFecha } from "@/lib/format/formato";

interface FaseCostesTablaProps {
  proyecto: Proyecto;
}

export default function FaseCostesTabla({ proyecto }: FaseCostesTablaProps) {
  const filas = ordenFases
    .map((fase) => ({ fase, detalle: proyecto.detallePorFase[fase] }))
    .filter((item) => item.detalle);

  return (
    <table className="w-full text-left text-sm">
      <thead className="text-slate-500">
        <tr>
          <th className="py-2 pr-4 font-medium">Fase</th>
          <th className="py-2 pr-4 font-medium">Coste estimado</th>
          <th className="py-2 font-medium">Periodo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {filas.map(({ fase, detalle }) => (
          <tr key={fase}>
            <td className="py-2 pr-4">{fase}</td>
            <td className="py-2 pr-4">
              {detalle?.coste !== undefined ? formatearEuros(detalle.coste) : "—"}
            </td>
            <td className="py-2">
              {detalle?.fechaInicio && detalle?.fechaFin
                ? `${formatearFecha(detalle.fechaInicio)} – ${formatearFecha(detalle.fechaFin)}`
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
