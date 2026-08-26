"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import GanttChart from "@/components/cronograma/GanttChart";
import { useProyectos } from "@/lib/proyectos/ProyectosContext";

export default function PaginaCronograma() {
  const { proyectos } = useProyectos();
  const anioActual = new Date().getFullYear();
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);

  const aniosDisponibles = [
    anioActual - 2,
    anioActual - 1,
    anioActual,
    anioActual + 1,
    anioActual + 2,
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Portfolio de proyectos industriales
            </p>
            <h2 className="mt-2 text-3xl font-bold">Cronograma</h2>
            <p className="mt-2 text-slate-600">
              Ejecución de los proyectos mes a mes, por fase.
            </p>
          </header>

          <div className="mb-4 flex gap-2">
            {aniosDisponibles.map((anio) => (
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

          <GanttChart proyectos={proyectos} anio={anioSeleccionado} />
        </section>
      </div>
    </main>
  );
}
