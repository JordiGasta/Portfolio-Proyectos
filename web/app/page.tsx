import Sidebar from "@/components/layout/Sidebar";
import ResumenIndicadores from "@/components/dashboard/ResumenIndicadores";
import GraficoBarrasFase from "@/components/dashboard/GraficoBarrasFase";
import TablaProyectos from "@/components/proyectos/TablaProyectos";
import { proyectos } from "@/lib/data/proyectos";
import { calcularResumen, contarPorFase } from "@/lib/proyectos/calculos";

export default function Home() {
  const resumen = calcularResumen(proyectos);
  const distribucionPorFase = contarPorFase(proyectos);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Portfolio de proyectos industriales
            </p>

            <h2 className="mt-2 text-3xl font-bold">Dashboard general</h2>

            <p className="mt-2 text-slate-600">
              Seguimiento económico, temporal y operativo de los proyectos.
            </p>
          </header>

          <ResumenIndicadores resumen={resumen} />

          <section className="mt-6 max-w-2xl">
            <GraficoBarrasFase
              titulo="Distribución por fase"
              elementos={distribucionPorFase}
            />
          </section>

          <div className="mt-8">
            <TablaProyectos proyectos={proyectos} />
          </div>
        </section>
      </div>
    </main>
  );
}