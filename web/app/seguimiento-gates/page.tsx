"use client";

import Sidebar from "@/components/layout/Sidebar";
import TablaGates from "@/components/gates/TablaGates";
import { useProyectos } from "@/lib/proyectos/ProyectosContext";
import { tieneGateVencido } from "@/lib/proyectos/calculos";

export default function PaginaSeguimientoGates() {
  const { proyectos } = useProyectos();

  const gatesVencidos = proyectos.filter(tieneGateVencido);

  const proximosGates = proyectos
    .filter((proyecto) => !tieneGateVencido(proyecto))
    .filter((proyecto) => Boolean(proyecto.fechaProximoGate))
    .filter((proyecto) => proyecto.estado !== "Cancelado" && proyecto.fase !== "Fase V — Cierre")
    .sort((a, b) => {
      const fechaA = a.fechaProximoGate ?? "";
      const fechaB = b.fechaProximoGate ?? "";
      return fechaA.localeCompare(fechaB);
    });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 space-y-6 p-6 lg:p-10">
          <header>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Portfolio de proyectos industriales
            </p>
            <h2 className="mt-2 text-3xl font-bold">Seguimiento de gates</h2>
            <p className="mt-2 text-slate-600">
              Gates vencidos y próximos, y detección de proyectos sin avance.
            </p>
          </header>

          <TablaGates
            titulo={`Gates vencidos (${gatesVencidos.length})`}
            colorTitulo="rojo"
            proyectos={gatesVencidos}
            etiquetaFecha="Vencía"
            colorFecha="rojo"
            mensajeVacio="No hay gates vencidos. Todo en plazo."
          />

          <TablaGates
            titulo={`Próximos gates (${proximosGates.length})`}
            colorTitulo="slate"
            proyectos={proximosGates}
            etiquetaFecha="Fecha objetivo"
            colorFecha="slate"
            mensajeVacio="No hay próximos gates pendientes."
          />
        </section>
      </div>
    </main>
  );
}
