import IndicadorCard from "@/components/dashboard/IndicadorCard";
import type { Proyecto } from "@/types/proyecto";
import {
  contarActivosPorCategoria,
  contarSobrecostes,
  proyectosActivos,
  sumarGastadoActivos,
  sumarPresupuestoActivos,
  tieneGateVencido,
} from "@/lib/proyectos/calculos";
import { calcularDemandaAnual } from "@/lib/proyectos/capex";
import { ENVELOPE_CAPEX_ANUAL } from "@/lib/configuracion";
import { formatearEuros } from "@/lib/format/formato";

interface ResumenIndicadoresProps {
  proyectos: Proyecto[];
}

export default function ResumenIndicadores({
  proyectos,
}: ResumenIndicadoresProps) {
  const activos = proyectosActivos(proyectos);

  const porCategoria = contarActivosPorCategoria(proyectos);
  const subEtiquetaActivos =
    porCategoria
      .filter((item) => item.cantidad > 0)
      .map((item) => `${item.cantidad} ${item.categoria.toLowerCase()}`)
      .join(" · ") || "Sin proyectos activos";

  const gatesVencidos = proyectos.filter(tieneGateVencido).length;

  const presupuestoActivos = sumarPresupuestoActivos(proyectos);
  const gastadoActivos = sumarGastadoActivos(proyectos);

  const anioActual = new Date().getFullYear();
  const demandaFY = calcularDemandaAnual(proyectos, anioActual);
  const porcentajeEnvelope = Math.round(
    (demandaFY / ENVELOPE_CAPEX_ANUAL) * 100,
  );

  const sobrecostes = contarSobrecostes(proyectos);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <IndicadorCard
        etiqueta="Proyectos activos"
        valor={activos.length}
        subEtiqueta={subEtiquetaActivos}
      />

      <IndicadorCard
        etiqueta="Gates vencidos"
        valor={gatesVencidos}
        subEtiqueta={
          gatesVencidos > 0 ? `${gatesVencidos} requieren acción` : "Todo en plazo"
        }
        colorSubEtiqueta={gatesVencidos > 0 ? "rojo" : "verde"}
      />

      <IndicadorCard
        etiqueta="Presupuesto del portfolio"
        valor={formatearEuros(presupuestoActivos)}
        subEtiqueta={`${formatearEuros(gastadoActivos)} gastado a fecha`}
      />

      <IndicadorCard
        etiqueta="Demanda del ejercicio"
        valor={formatearEuros(Math.round(demandaFY))}
        subEtiqueta={`${porcentajeEnvelope}% del techo anual de CAPEX`}
      />

      <IndicadorCard
        etiqueta="Sobrecostes"
        valor={sobrecostes}
        subEtiqueta={
          sobrecostes > 0
            ? `${sobrecostes} proyectos >10% sobre presupuesto`
            : "Sin sobrecostes"
        }
        colorSubEtiqueta={sobrecostes > 0 ? "rojo" : "verde"}
      />
    </section>
  );
}
