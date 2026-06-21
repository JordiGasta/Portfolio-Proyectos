"use client";

import Sidebar from "@/components/layout/Sidebar";
import ResumenIndicadores from "@/components/dashboard/ResumenIndicadores";
import BubbleChart from "@/components/consejo/BubbleChart";
import TablaProyectosCondensada from "@/components/consejo/TablaProyectosCondensada";
import DemandaChart from "@/components/capex/DemandaChart";
import { useProyectos } from "@/lib/proyectos/ProyectosContext";
import { proyectosActivos } from "@/lib/proyectos/calculos";

export default function PaginaInformeConsejo() {
  const { proyectos } = useProyectos();
  const activos = proyectosActivos(proyectos);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 space-y-6 p-6 lg:p-10">
          <header>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Portfolio de proyectos industriales
            </p>
            <h2 className="mt-2 text-3xl font-bold">Informe de consejo</h2>
            <p className="mt-2 text-slate-600">
              Resumen ejecutivo de solo lectura del estado del portfolio.
            </p>
          </header>

          <ResumenIndicadores proyectos={proyectos} />

          <BubbleChart proyectos={activos} />

          <TablaProyectosCondensada proyectos={activos} />

          <DemandaChart proyectos={proyectos} />
        </section>
      </div>
    </main>
  );
}
