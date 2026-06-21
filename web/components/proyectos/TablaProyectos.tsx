import type { Proyecto } from "@/types/proyecto";
import FilaProyecto from "@/components/proyectos/FilaProyecto";

interface TablaProyectosProps {
  proyectos: Proyecto[];
  titulo?: string;
  descripcion?: string;
  sinBorde?: boolean;
  onSeleccionar: (proyecto: Proyecto) => void;
  onNuevo?: () => void;
}

export default function TablaProyectos({
  proyectos,
  titulo = "Proyectos",
  descripcion = "Relación de proyectos incluidos en el portfolio.",
  sinBorde = false,
  onSeleccionar,
  onNuevo,
}: TablaProyectosProps) {
  return (
    <section
      className={
        sinBorde
          ? "overflow-hidden bg-white"
          : "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      }
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">{titulo}</h3>
          <p className="text-sm text-slate-500">{descripcion}</p>
        </div>

        <button
          type="button"
          onClick={onNuevo}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nuevo proyecto
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Proyecto</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Fase</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Próximo gate</th>
              <th className="px-5 py-3 font-medium">Presupuesto</th>
              <th className="px-5 py-3 font-medium">Actuals</th>
              <th className="px-5 py-3 font-medium">EAC</th>
              <th className="px-5 py-3 font-medium">Variación</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {proyectos.map((proyecto) => (
              <FilaProyecto
                key={proyecto.id}
                proyecto={proyecto}
                onSeleccionar={onSeleccionar}
              />
            ))}
          </tbody>
        </table>
      </div>

      {proyectos.length === 0 && (
        <p className="p-5 text-sm text-slate-500">
          No hay proyectos que coincidan con los criterios indicados.
        </p>
      )}
    </section>
  );
}
