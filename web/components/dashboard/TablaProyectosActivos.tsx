import Link from "next/link";
import type { Proyecto } from "@/types/proyecto";
import EstadoSaludDot from "@/components/proyectos/EstadoSaludDot";
import { calcularEAC } from "@/lib/proyectos/calculos";
import { formatearEuros } from "@/lib/format/formato";

interface TablaProyectosActivosProps {
  proyectos: Proyecto[];
}

export default function TablaProyectosActivos({ proyectos }: TablaProyectosActivosProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-900">Proyectos activos</h3>
        <Link href="/proyectos" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Ver todos →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Proyecto</th>
              <th className="px-5 py-3 font-medium">Fase</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Presupuesto</th>
              <th className="px-5 py-3 font-medium">EAC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {proyectos.map((proyecto) => (
              <tr key={proyecto.id} className="cursor-pointer hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/proyectos/${proyecto.id}`} className="block font-medium text-slate-900">
                    {proyecto.nombre}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/proyectos/${proyecto.id}`} className="block">{proyecto.fase}</Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/proyectos/${proyecto.id}`} className="block">
                    <EstadoSaludDot estado={proyecto.estado} />
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/proyectos/${proyecto.id}`} className="block">{formatearEuros(proyecto.presupuestoAprobado)}</Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/proyectos/${proyecto.id}`} className="block">{formatearEuros(calcularEAC(proyecto))}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {proyectos.length === 0 && <p className="p-5 text-sm text-slate-500">No hay proyectos activos.</p>}
    </section>
  );
}
