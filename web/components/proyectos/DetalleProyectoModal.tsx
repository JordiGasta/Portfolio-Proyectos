"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { Proyecto } from "@/types/proyecto";
import EstadoSaludDot from "@/components/proyectos/EstadoSaludDot";
import CategoriaBadge from "@/components/proyectos/CategoriaBadge";
import GateProgresionPills from "@/components/proyectos/GateProgresionPills";
import FaseCostesTabla from "@/components/proyectos/FaseCostesTabla";
import VariacionBadge from "@/components/proyectos/VariacionBadge";
import {
  calcularEAC,
  calcularVariacionPorcentual,
  obtenerProximoGate,
} from "@/lib/proyectos/calculos";
import { generarGateReviewDocx } from "@/lib/proyectos/gateReviewDocx";
import { formatearEuros, formatearFecha } from "@/lib/format/formato";

interface DetalleProyectoModalProps {
  proyecto: Proyecto;
  onCerrar: () => void;
  onEditar?: () => void;
}

export default function DetalleProyectoModal({
  proyecto,
  onCerrar,
  onEditar,
}: DetalleProyectoModalProps) {
  const eac = calcularEAC(proyecto);
  const variacion = calcularVariacionPorcentual(proyecto);
  const proximoGate = obtenerProximoGate(proyecto);
  const [generando, setGenerando] = useState(false);
  const [errorGeneracion, setErrorGeneracion] = useState<string | null>(null);

  const manejarGenerarPaquete = async () => {
    setGenerando(true);
    setErrorGeneracion(null);

    try {
      await generarGateReviewDocx(proyecto);
    } catch {
      setErrorGeneracion(
        "No se ha podido generar el documento. Inténtalo de nuevo.",
      );
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 py-10">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-sm text-slate-500">
              {proyecto.codigo} · {proyecto.categoria}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {proyecto.nombre}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{proyecto.fase}</p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Campo
              etiqueta="Estado"
              valor={<EstadoSaludDot estadoSalud={proyecto.estadoSalud} />}
            />
            <Campo etiqueta="Propietario" valor={proyecto.propietario || "—"} />
            <Campo etiqueta="Sponsor" valor={proyecto.sponsor} />
            <Campo etiqueta="Rigurosidad" valor={proyecto.rigurosidad} />
            <Campo
              etiqueta="Categoría estratégica"
              valor={<CategoriaBadge categoria={proyecto.categoria} />}
            />
            <Campo
              etiqueta="Fecha prevista de fin"
              valor={formatearFecha(proyecto.fechaFinPrevista)}
            />
            <Campo
              etiqueta="Próximo gate"
              valor={
                proximoGate
                  ? `${proximoGate}${
                      proyecto.fechaProximoGate
                        ? ` — ${formatearFecha(proyecto.fechaProximoGate)}`
                        : ""
                    }`
                  : "Sin gates pendientes"
              }
            />
            {proyecto.categoria === "Protección de valor" &&
              proyecto.exposicionRiesgo !== undefined && (
                <Campo
                  etiqueta="Exposición al riesgo"
                  valor={formatearEuros(proyecto.exposicionRiesgo)}
                />
              )}
            {proyecto.categoria === "Creación de valor" &&
              proyecto.beneficioEsperado !== undefined && (
                <Campo
                  etiqueta="Beneficio esperado"
                  valor={formatearEuros(proyecto.beneficioEsperado)}
                />
              )}
          </section>

          <section className="mt-6 rounded-lg bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <Campo
                etiqueta="Presupuesto aprobado"
                valor={formatearEuros(proyecto.presupuestoAprobado)}
              />
              <Campo
                etiqueta="Actuals"
                valor={formatearEuros(proyecto.importeGastado)}
              />
              <Campo etiqueta="ETC" valor={formatearEuros(proyecto.etc)} />
              <Campo etiqueta="EAC" valor={formatearEuros(eac)} />
              <Campo
                etiqueta="Variación"
                valor={<VariacionBadge porcentaje={variacion} />}
              />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Progresión de gates
            </h3>
            <div className="mt-3">
              <GateProgresionPills proyecto={proyecto} />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Desglose de costes por fase
            </h3>
            <div className="mt-3">
              <FaseCostesTabla proyecto={proyecto} />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Descripción
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              {proyecto.descripcion}
            </p>
          </section>

          <section className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Actualizar actuals BC
            </button>
            <button
              type="button"
              onClick={manejarGenerarPaquete}
              disabled={generando}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {generando ? "Generando…" : "Generar paquete de gate review"}
            </button>
            {onEditar && (
              <button
                type="button"
                onClick={onEditar}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Editar proyecto
              </button>
            )}
            {errorGeneracion && (
              <p className="text-sm text-rose-600">{errorGeneracion}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{etiqueta}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{valor}</p>
    </div>
  );
}
