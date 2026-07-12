"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TablaProyectos from "@/components/proyectos/TablaProyectos";
import FiltrosProyectos, { type FiltrosProyectosValor } from "@/components/proyectos/FiltrosProyectos";
import DetalleProyectoModal from "@/components/proyectos/DetalleProyectoModal";
import ProyectoFormModal from "@/components/proyectos/ProyectoFormModal";
import { useProyectos } from "@/lib/proyectos/ProyectosContext";
import { filtrarProyectos } from "@/lib/proyectos/filtros";
import type { Proyecto } from "@/types/proyecto";

const filtrosIniciales: FiltrosProyectosValor = {
  fase: "Todas",
  categoria: "Todas",
  estado: "Todos",
};

type EstadoFormulario = "nuevo" | "editar" | null;

export default function PaginaProyectos() {
  const { proyectos, agregarProyecto, actualizarProyecto } = useProyectos();
  const [filtros, setFiltros] = useState<FiltrosProyectosValor>(filtrosIniciales);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
  const [formularioAbierto, setFormularioAbierto] = useState<EstadoFormulario>(null);
  const [proyectoEnEdicion, setProyectoEnEdicion] = useState<Proyecto | null>(null);

  const proyectosFiltrados = useMemo(
    () => filtrarProyectos(proyectos, filtros),
    [proyectos, filtros],
  );

  const abrirNuevo = () => {
    setProyectoEnEdicion(null);
    setFormularioAbierto("nuevo");
  };

  const abrirEdicion = (proyecto: Proyecto) => {
    setProyectoSeleccionado(null);
    setProyectoEnEdicion(proyecto);
    setFormularioAbierto("editar");
  };

  const guardarProyecto = (proyecto: Proyecto, esNuevo: boolean) => {
    if (esNuevo) {
      agregarProyecto(proyecto);
    } else {
      actualizarProyecto(proyecto);
    }
    setFormularioAbierto(null);
    setProyectoEnEdicion(null);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Portfolio de proyectos industriales
            </p>
            <h2 className="mt-2 text-3xl font-bold">Proyectos</h2>
            <p className="mt-2 text-slate-600">
              Listado completo de proyectos del portfolio. Selecciona uno para ver su ficha completa.
            </p>
          </header>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <FiltrosProyectos valor={filtros} onCambiar={setFiltros} />
            <TablaProyectos
              proyectos={proyectosFiltrados}
              titulo="Listado de proyectos"
              descripcion={`${proyectosFiltrados.length} de ${proyectos.length} proyectos`}
              sinBorde
              onSeleccionar={setProyectoSeleccionado}
              onNuevo={abrirNuevo}
            />
          </section>
        </section>
      </div>

      {proyectoSeleccionado && (
        <DetalleProyectoModal
          proyecto={proyectoSeleccionado}
          onCerrar={() => setProyectoSeleccionado(null)}
          onEditar={() => abrirEdicion(proyectoSeleccionado)}
          onCerrarProyecto={(proyectoActualizado) => {
            actualizarProyecto(proyectoActualizado);
            setProyectoSeleccionado(null);
          }}
        />
      )}

      {formularioAbierto && (
        <ProyectoFormModal
          proyectoBase={proyectoEnEdicion ?? undefined}
          proyectosExistentes={proyectos}
          onGuardar={guardarProyecto}
          onCerrar={() => {
            setFormularioAbierto(null);
            setProyectoEnEdicion(null);
          }}
        />
      )}
    </main>
  );
}
