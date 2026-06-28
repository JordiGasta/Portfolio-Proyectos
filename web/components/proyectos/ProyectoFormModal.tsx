"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type {
  CategoriaProyecto,
  Departamento,
  EstadoProyecto,
  FaseProyecto,
  Gate,
  HorizonteTemporal,
  NivelRiesgo,
  ObjetivoEstrategico,
  Prioridad,
  Proyecto,
  Rigurosidad,
  TipoProyecto,
} from "@/types/proyecto";
import {
  derivarGateStatusDesdeGateActual,
  ordenCategorias,
  ordenEstadosProyecto,
  ordenFases,
  ordenGates,
  ordenObjetivosEstrategicos,
} from "@/lib/proyectos/calculos";
import { generarIdentificadorProyecto } from "@/lib/proyectos/identificadores";

const tiposProyecto: TipoProyecto[] = [
  "CAPEX",
  "OPEX",
  "Mejora continua",
  "Mantenimiento",
  "Normativo",
];

const departamentos: Departamento[] = [
  "Producción",
  "Mantenimiento",
  "Ingeniería",
  "Calidad",
  "Logística",
  "Medio Ambiente",
  "Dirección",
];

const prioridades: Prioridad[] = ["Alta", "Media", "Baja"];
const rigurosidades: Rigurosidad[] = ["R1", "R2", "R3"];
const nivelesRiesgo: NivelRiesgo[] = ["Bajo", "Medio", "Alto"];
const horizontes: HorizonteTemporal[] = ["Corto plazo", "Medio plazo", "Largo plazo"];

interface ProyectoFormModalProps {
  proyectoBase?: Proyecto;
  proyectosExistentes: Proyecto[];
  onGuardar: (proyecto: Proyecto, esNuevo: boolean) => void;
  onCerrar: () => void;
}

function crearProyectoVacio(proyectosExistentes: Proyecto[]): Proyecto {
  const identificador = generarIdentificadorProyecto(proyectosExistentes);
  const hoy = new Date().toISOString().slice(0, 10);

  return {
    id: identificador,
    codigo: identificador,
    nombre: "",
    descripcion: "",
    responsable: "",
    departamento: "Producción",
    tipo: "CAPEX",
    fase: "Fase 0 — Fase previa",
    rigurosidad: "R1",
    presupuestoAprobado: 0,
    importeComprometido: 0,
    importeGastado: 0,
    fechaInicio: hoy,
    fechaFinPrevista: hoy,
    avance: 0,
    prioridad: "Media",
    observaciones: "",
    categoria: "Creación de valor",
    estado: "En curso",
    objetivoEstrategico: "Fiabilidad operativa",
    propietario: "",
    sponsor: "",
    gateActual: "G0",
    gateStatus: derivarGateStatusDesdeGateActual("G0"),
    fechaProximoGate: undefined,
    fechaUltimoGate: undefined,
    etc: 0,
    numeroJobBC: null,
    exposicionRiesgo: undefined,
    beneficioEsperado: undefined,
    motivoCancelacion: undefined,
    nivelRiesgo: "Medio",
    horizonteTemporal: "Medio plazo",
    detallePorFase: {},
  };
}

export default function ProyectoFormModal({
  proyectoBase,
  proyectosExistentes,
  onGuardar,
  onCerrar,
}: ProyectoFormModalProps) {
  const esNuevo = !proyectoBase;
  const [proyecto, setProyecto] = useState<Proyecto>(
    proyectoBase ?? crearProyectoVacio(proyectosExistentes),
  );
  const [error, setError] = useState<string | null>(null);

  const actualizarCampo = <K extends keyof Proyecto>(campo: K, valor: Proyecto[K]) => {
    setProyecto((actual) => ({ ...actual, [campo]: valor }));
  };

  const cambiarGateActual = (gate: Gate) => {
    setProyecto((actual) => ({
      ...actual,
      gateActual: gate,
      gateStatus: derivarGateStatusDesdeGateActual(gate),
    }));
  };

  const manejarEnvio = (evento: FormEvent) => {
    evento.preventDefault();

    if (
      !proyecto.nombre.trim() ||
      !proyecto.sponsor.trim() ||
      !proyecto.responsable.trim() ||
      !proyecto.descripcion.trim()
    ) {
      setError("Completa los campos obligatorios: título, sponsor, project manager y descripción.");
      return;
    }

    if (proyecto.estado === "Cancelado" && !proyecto.motivoCancelacion?.trim()) {
      setError("Indica el motivo de cancelación, obligatorio cuando el estado es Cancelado.");
      return;
    }

    setError(null);
    onGuardar(proyecto, esNuevo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 py-10">
      <form onSubmit={manejarEnvio} className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {esNuevo ? "Nuevo proyecto" : "Editar proyecto"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Identificador: {proyecto.codigo}</p>
          </div>
          <button type="button" onClick={onCerrar} className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100">
            Cerrar
          </button>
        </div>

        <div className="max-h-[70vh] space-y-8 overflow-y-auto p-6">
          {error && <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Datos obligatorios</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Título *">
                <input
                  type="text" required value={proyecto.nombre}
                  onChange={(e) => actualizarCampo("nombre", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Categoría estratégica *">
                <select
                  required value={proyecto.categoria}
                  onChange={(e) => actualizarCampo("categoria", e.target.value as CategoriaProyecto)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {ordenCategorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Objetivo estratégico *">
                <select
                  required value={proyecto.objetivoEstrategico}
                  onChange={(e) => actualizarCampo("objetivoEstrategico", e.target.value as ObjetivoEstrategico)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {ordenObjetivosEstrategicos.map((obj) => <option key={obj} value={obj}>{obj}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Rigurosidad *">
                <select
                  required value={proyecto.rigurosidad}
                  onChange={(e) => actualizarCampo("rigurosidad", e.target.value as Rigurosidad)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {rigurosidades.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Fase *">
                <select
                  required value={proyecto.fase}
                  onChange={(e) => actualizarCampo("fase", e.target.value as FaseProyecto)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {ordenFases.map((fase) => <option key={fase} value={fase}>{fase}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Sponsor *">
                <input
                  type="text" required value={proyecto.sponsor}
                  onChange={(e) => actualizarCampo("sponsor", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Project Manager *">
                <input
                  type="text" required value={proyecto.responsable}
                  onChange={(e) => actualizarCampo("responsable", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>
            </div>

            <div className="mt-4">
              <Campo etiqueta="Descripción *">
                <textarea
                  required rows={3} value={proyecto.descripcion}
                  onChange={(e) => actualizarCampo("descripcion", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Datos adicionales (opcionales)</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Campo etiqueta="Departamento">
                <select
                  value={proyecto.departamento}
                  onChange={(e) => actualizarCampo("departamento", e.target.value as Departamento)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Tipo de inversión">
                <select
                  value={proyecto.tipo}
                  onChange={(e) => actualizarCampo("tipo", e.target.value as TipoProyecto)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {tiposProyecto.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Estado">
                <select
                  value={proyecto.estado}
                  onChange={(e) => actualizarCampo("estado", e.target.value as EstadoProyecto)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {ordenEstadosProyecto.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
                </select>
              </Campo>

              {proyecto.estado === "Cancelado" && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <Campo etiqueta="Motivo de cancelación *">
                    <textarea
                      rows={2} value={proyecto.motivoCancelacion ?? ""}
                      onChange={(e) => actualizarCampo("motivoCancelacion", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </Campo>
                </div>
              )}

              <Campo etiqueta="Nivel de riesgo">
                <select
                  value={proyecto.nivelRiesgo}
                  onChange={(e) => actualizarCampo("nivelRiesgo", e.target.value as NivelRiesgo)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {nivelesRiesgo.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Horizonte temporal">
                <select
                  value={proyecto.horizonteTemporal}
                  onChange={(e) => actualizarCampo("horizonteTemporal", e.target.value as HorizonteTemporal)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {horizontes.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Propietario">
                <input
                  type="text" value={proyecto.propietario}
                  onChange={(e) => actualizarCampo("propietario", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Prioridad">
                <select
                  value={proyecto.prioridad}
                  onChange={(e) => actualizarCampo("prioridad", e.target.value as Prioridad)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {prioridades.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Presupuesto aprobado (€)">
                <input
                  type="number" min={0} value={proyecto.presupuestoAprobado}
                  onChange={(e) => actualizarCampo("presupuestoAprobado", Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Importe comprometido (€)">
                <input
                  type="number" min={0} value={proyecto.importeComprometido}
                  onChange={(e) => actualizarCampo("importeComprometido", Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta={proyecto.numeroJobBC ? "Actuals (€) — vinculado a BC, solo lectura" : "Actuals (€)"}>
                <input
                  type="number" min={0} disabled={Boolean(proyecto.numeroJobBC)} value={proyecto.importeGastado}
                  onChange={(e) => actualizarCampo("importeGastado", Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="ETC (€)">
                <input
                  type="number" min={0} value={proyecto.etc}
                  onChange={(e) => actualizarCampo("etc", Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Número Job BC">
                <input
                  type="text" value={proyecto.numeroJobBC ?? ""}
                  onChange={(e) => actualizarCampo("numeroJobBC", e.target.value.trim() === "" ? null : e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Fecha de inicio">
                <input
                  type="date" value={proyecto.fechaInicio}
                  onChange={(e) => actualizarCampo("fechaInicio", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Fecha prevista de fin">
                <input
                  type="date" value={proyecto.fechaFinPrevista}
                  onChange={(e) => actualizarCampo("fechaFinPrevista", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Avance (%)">
                <input
                  type="number" min={0} max={100} value={proyecto.avance}
                  onChange={(e) => actualizarCampo("avance", Number(e.target.value))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Gate actual">
                <select
                  value={proyecto.gateActual}
                  onChange={(e) => cambiarGateActual(e.target.value as Gate)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  {ordenGates.map((gate) => <option key={gate} value={gate}>{gate}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Fecha próximo gate">
                <input
                  type="date" value={proyecto.fechaProximoGate ?? ""}
                  onChange={(e) => actualizarCampo("fechaProximoGate", e.target.value === "" ? undefined : e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              <Campo etiqueta="Fecha último gate">
                <input
                  type="date" value={proyecto.fechaUltimoGate ?? ""}
                  onChange={(e) => actualizarCampo("fechaUltimoGate", e.target.value === "" ? undefined : e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>

              {proyecto.categoria === "Protección de valor" && (
                <Campo etiqueta="Exposición al riesgo (€)">
                  <input
                    type="number" min={0} value={proyecto.exposicionRiesgo ?? 0}
                    onChange={(e) => actualizarCampo("exposicionRiesgo", Number(e.target.value))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </Campo>
              )}

              {proyecto.categoria === "Creación de valor" && (
                <Campo etiqueta="Beneficio esperado (€)">
                  <input
                    type="number" min={0} value={proyecto.beneficioEsperado ?? 0}
                    onChange={(e) => actualizarCampo("beneficioEsperado", Number(e.target.value))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </Campo>
              )}
            </div>

            <div className="mt-4">
              <Campo etiqueta="Observaciones">
                <textarea
                  rows={2} value={proyecto.observaciones}
                  onChange={(e) => actualizarCampo("observaciones", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </Campo>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              El desglose de coste por fase no es editable todavía desde este formulario.
            </p>
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 p-6">
          <button type="button" onClick={onCerrar} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            {esNuevo ? "Crear proyecto" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{etiqueta}</span>
      {children}
    </label>
  );
}
