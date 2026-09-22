"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DemandaSemestralChart from "@/components/capex/DemandaSemestralChart";
import PresupuestoVsGastoAcumuladoChart from "@/components/capex/PresupuestoVsGastoAcumuladoChart";
import { useProyectos } from "@/lib/proyectos/ProyectosContext";
import { detectarAnios, type FilaHistoricoCapex } from "@/lib/proyectos/anual";

export default function PaginaDemandaCapex() {
  const { proyectos } = useProyectos();
  const anios = detectarAnios();
  const anioActual = new Date().getFullYear();
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [historico, setHistorico] = useState<FilaHistoricoCapex[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarHistorico() {
      try {
        const respuesta = await fetch("/api/historico-capex", {
          cache: "no-store",
        });
        const datos = await respuesta.json();
        if (activo && Array.isArray(datos.historico)) {
          setHistorico(datos.historico);
        }
      } catch {
        // Si falla, se queda el histórico vacío; la vista mostrará "—".
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarHistorico();
    return () => {
      activo = false;
    };
  }, []);

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
              Presupuesto aprobado y gasto acumulado por año.
            </p>
          </header>

          <div className="mb-6 flex gap-2">
            {anios.map((anio) => (
              <button
                key={anio}
                type="button"
                onClick={() => setAnioSeleccionado(anio)}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  anio === anioSeleccionado
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {anio}
              </button>
            ))}
          </div>

          {cargando ? (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Cargando datos de CAPEX…</p>
            </article>
          ) : (
            <>
              <DemandaSemestralChart
                proyectos={proyectos}
                historico={historico}
                anio={anioSeleccionado}
              />
              <PresupuestoVsGastoAcumuladoChart
                proyectos={proyectos}
                historico={historico}
                anio={anioSeleccionado}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
