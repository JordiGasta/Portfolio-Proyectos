import IndicadorCard from "@/components/dashboard/IndicadorCard";
import type { ResumenPortfolio } from "@/lib/proyectos/calculos";
import { formatearEuros } from "@/lib/format/formato";

interface ResumenIndicadoresProps {
  resumen: ResumenPortfolio;
}

export default function ResumenIndicadores({
  resumen,
}: ResumenIndicadoresProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <IndicadorCard
        etiqueta="Total de proyectos"
        valor={resumen.totalProyectos}
      />

      <IndicadorCard
        etiqueta="Proyectos en ejecución"
        valor={resumen.proyectosEnEjecucion}
      />

      <IndicadorCard
        etiqueta="Proyectos retrasados"
        valor={resumen.proyectosRetrasados}
        destacado={resumen.proyectosRetrasados > 0}
      />

      <IndicadorCard
        etiqueta="Presupuesto aprobado"
        valor={formatearEuros(resumen.presupuestoTotal)}
      />

      <IndicadorCard
        etiqueta="Importe comprometido"
        valor={formatearEuros(resumen.importeComprometidoTotal)}
      />

      <IndicadorCard
        etiqueta="Importe gastado"
        valor={formatearEuros(resumen.importeGastadoTotal)}
      />
    </section>
  );
}