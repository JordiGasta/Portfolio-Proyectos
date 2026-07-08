"use client";

import Sidebar from "@/components/layout/Sidebar";
import DemandaSemestralChart from "@/components/capex/DemandaSemestralChart";
import { useProyectos } from "@/lib/proyectos/ProyectosContext";

export default function PaginaDemandaCapex() {
  const { proyectos } = useProyectos();

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Portfolio de proyectos industriales
            </p>
            <h2 className="mt-2 text-3xl font-bold">Demanda CAPEX</h2>
            <p className="mt-2 text-slate-600">
              Presupuesto aprobado y gasto acumulado por semestre, para el
              año actual y el siguiente.
            </p>
          </header>

          <DemandaSemestralChart proyectos={proyectos} />
        </section>
      </div>
    </main>
  );
}
