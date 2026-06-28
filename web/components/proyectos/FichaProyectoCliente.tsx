"use client";

import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import EstadoSaludDot from "@/components/proyectos/EstadoSaludDot";
import BarraAvance from "@/components/proyectos/BarraAvance";
import DatoFicha from "@/components/proyectos/DatoFicha";
import { useProyectos } from "@/lib/proyectos/ProyectosContext";
import { formatearEuros, formatearFecha } from "@/lib/format/formato";

interface FichaProyectoClienteProps {
  id: string;
}

export default function FichaProyectoCliente({ id }: FichaProyectoClienteProps) {
  const { proyectos } = useProyectos();
  const proyecto = proyectos.find((elemento) => elemento.id === id);

  if (!proyecto) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <section className="flex-1 p-6 lg:p-10">
            <p className="text-slate-600">No se ha encontrado el proyecto solicitado.</p>
            <Link href="/proyectos" className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900">
              ← Volver al listado de proyectos
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 p-6 lg:p-10">
          <div className="mb-6">
            <Link href="/proyectos" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              ← Volver al listado de proyectos
            </Link>
          </div>

          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{proyecto.codigo}</p>
              <h2 className="mt-2 text-3xl font-bold">{proyecto.nombre}</h2>
              <p className="mt-2 max-w-2xl text-slate-600">{proyecto.descripcion}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <EstadoSaludDot estado={proyecto.estado} />
              <span className="text-sm text-slate-500">Prioridad: {proyecto.prioridad}</span>
            </div>
          </header>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Datos generales</h3>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <DatoFicha etiqueta="Código del proyecto" valor={proyecto.codigo} />
              <DatoFicha etiqueta="Responsable" valor={proyecto.responsable} />
              <DatoFicha etiqueta="Departamento" valor={proyecto.departamento} />
              <DatoFicha etiqueta="Tipo de proyecto" valor={proyecto.tipo} />
              <DatoFicha etiqueta="Fase" valor={proyecto.fase} />
              <DatoFicha etiqueta="Rigurosidad" valor={proyecto.rigurosidad} />
              <DatoFicha etiqueta="Objetivo estratégico" valor={proyecto.objetivoEstrategico} />
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Seguimiento económico</h3>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <DatoFicha etiqueta="Presupuesto aprobado" valor={formatearEuros(proyecto.presupuestoAprobado)} />
              <DatoFicha etiqueta="Importe comprometido" valor={formatearEuros(proyecto.importeComprometido)} />
              <DatoFicha etiqueta="Importe gastado" valor={formatearEuros(proyecto.importeGastado)} />
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Seguimiento temporal</h3>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <DatoFicha etiqueta="Fecha de inicio" valor={formatearFecha(proyecto.fechaInicio)} />
              <DatoFicha etiqueta="Fecha prevista de finalización" valor={formatearFecha(proyecto.fechaFinPrevista)} />
              <DatoFicha etiqueta="Porcentaje de avance" valor={<BarraAvance porcentaje={proyecto.avance} />} />
            </div>
          </section>

          {proyecto.estado === "Cancelado" && proyecto.motivoCancelacion && (
            <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
              <h3 className="text-lg font-semibold text-rose-700">Motivo de cancelación</h3>
              <p className="mt-3 text-rose-700">{proyecto.motivoCancelacion}</p>
            </section>
          )}

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Observaciones</h3>
            <p className="mt-3 text-slate-700">{proyecto.observaciones || "Sin observaciones."}</p>
          </section>
        </section>
      </div>
    </main>
  );
}
