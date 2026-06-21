import Sidebar from "@/components/layout/Sidebar";
import ResumenIndicadores from "@/components/dashboard/ResumenIndicadores";
import PortfolioMixChart from "@/components/dashboard/PortfolioMixChart";
import HealthBreakdown from "@/components/dashboard/HealthBreakdown";
import TablaProyectosActivos from "@/components/dashboard/TablaProyectosActivos";
import CapexDemandResumen from "@/components/dashboard/CapexDemandResumen";
import GraficoBarrasFase from "@/components/dashboard/GraficoBarrasFase";
import { proyectos } from "@/lib/data/proyectos";
import { contarPorFase, proyectosActivos } from "@/lib/proyectos/calculos";

export default function Home() {
  const distribucionPorFase = contarPorFase(proyectos);
  const activos = proyectosActivos(proyectos);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Portfolio de proyectos industriales
            </p>
            <h2 className="mt-2 text-3xl font-bold">Resumen</h2>
            <p className="mt-2 text-slate-600">
              Visión general del estado económico, temporal y de salud del
              portfolio.
            </p>
          </header>

          <ResumenIndicadores proyectos={proyectos} />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <PortfolioMixChart proyectos={proyectos} />
            <HealthBreakdown proyectos={proyectos} />
          </div>

          <div className="mt-6">
            <TablaProyectosActivos proyectos={activos} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <CapexDemandResumen proyectos={proyectos} />
            <GraficoBarrasFase
              titulo="Distribución por fase"
              elementos={distribucionPorFase}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
