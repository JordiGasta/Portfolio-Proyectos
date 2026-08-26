import type { Proyecto } from "@/types/proyecto";

export interface FilaHistoricoCapex {
  projectId: string;
  anio: number;
  presupuestoAnual: number;
  gastadoAnual: number;
}

export interface ContribucionProyectoAnio {
  proyecto: Proyecto;
  presupuesto: number;
  gastado: number;
  esEstimado: boolean;
}

export interface DatosAnio {
  anio: number;
  presupuesto: number;
  gastado: number;
  contribuciones: ContribucionProyectoAnio[];
}

export interface DatosSemestreAnio {
  semestre: 1 | 2;
  presupuesto: number;
  gastado: number;
  esEstimado: boolean;
  contribuciones: ContribucionProyectoAnio[];
}

/**
 * Detecta los años a mostrar en el selector: el año actual, los 2
 * anteriores y los 2 siguientes (igual que en el Cronograma).
 */
export function detectarAnios(): number[] {
  const anioActual = new Date().getFullYear();
  return [
    anioActual - 2,
    anioActual - 1,
    anioActual,
    anioActual + 1,
    anioActual + 2,
  ];
}

/**
 * Para un año concreto, busca en el histórico real (leído de
 * HistoricoCapexAnual) la fila de cada proyecto. Si un proyecto no
 * tiene fila para ese año (todavía no se ha dado de alta el
 * presupuesto de ese ejercicio, o el proyecto ya no existía), no
 * aporta nada a ese año. La app nunca calcula ni estima el
 * presupuesto: solo muestra lo que Finanzas ha registrado.
 */
export function calcularDatosPorAnio(
  proyectos: Proyecto[],
  historico: FilaHistoricoCapex[],
  anio: number,
): DatosAnio {
  let presupuesto = 0;
  let gastado = 0;
  const contribuciones: ContribucionProyectoAnio[] = [];

  proyectos.forEach((proyecto) => {
    const fila = historico.find(
      (h) => h.projectId === proyecto.codigo && h.anio === anio,
    );
    if (!fila) {
      return;
    }

    presupuesto += fila.presupuestoAnual;
    gastado += fila.gastadoAnual;
    contribuciones.push({
      proyecto,
      presupuesto: fila.presupuestoAnual,
      gastado: fila.gastadoAnual,
      esEstimado: false,
    });
  });

  contribuciones.sort((a, b) => b.presupuesto - a.presupuesto);
  return { anio, presupuesto, gastado, contribuciones };
}

/**
 * Reparte los datos anuales de un proyecto entre S1 y S2. Si el
 * proyecto es el año en curso y tiene desglose mensual real
 * (gastoMensual2026), se usa ese detalle exacto. Si no hay desglose
 * mensual disponible, se reparte el total a partes iguales (50/50)
 * entre los dos semestres, marcado como estimado.
 */
export function calcularDatosPorSemestreDeAnio(
  proyectos: Proyecto[],
  historico: FilaHistoricoCapex[],
  anio: number,
): [DatosSemestreAnio, DatosSemestreAnio] {
  const anioActual = new Date().getFullYear();
  const resultado: [DatosSemestreAnio, DatosSemestreAnio] = [
    { semestre: 1, presupuesto: 0, gastado: 0, esEstimado: false, contribuciones: [] },
    { semestre: 2, presupuesto: 0, gastado: 0, esEstimado: false, contribuciones: [] },
  ];

  proyectos.forEach((proyecto) => {
    const fila = historico.find(
      (h) => h.projectId === proyecto.codigo && h.anio === anio,
    );
    if (!fila) {
      return;
    }

    const meses = anio === anioActual ? proyecto.gastoMensual2026 : undefined;
    const hayDatosMensuales = meses && meses.some((m) => m > 0);

    if (hayDatosMensuales && meses) {
      const gastadoS1 = meses.slice(0, 6).reduce((t, v) => t + (v ?? 0), 0);
      const gastadoS2 = meses.slice(6, 12).reduce((t, v) => t + (v ?? 0), 0);
      const presupuestoS1 = fila.presupuestoAnual / 2;
      const presupuestoS2 = fila.presupuestoAnual / 2;

      resultado[0].presupuesto += presupuestoS1;
      resultado[0].gastado += gastadoS1;
      resultado[0].contribuciones.push({
        proyecto, presupuesto: presupuestoS1, gastado: gastadoS1, esEstimado: false,
      });

      resultado[1].presupuesto += presupuestoS2;
      resultado[1].gastado += gastadoS2;
      resultado[1].contribuciones.push({
        proyecto, presupuesto: presupuestoS2, gastado: gastadoS2, esEstimado: false,
      });
    } else {
      // Sin desglose mensual real: reparto 50/50 estimado.
      const mitad = (valor: number) => valor / 2;

      resultado[0].presupuesto += mitad(fila.presupuestoAnual);
      resultado[0].gastado += mitad(fila.gastadoAnual);
      resultado[0].esEstimado = true;
      resultado[0].contribuciones.push({
        proyecto,
        presupuesto: mitad(fila.presupuestoAnual),
        gastado: mitad(fila.gastadoAnual),
        esEstimado: true,
      });

      resultado[1].presupuesto += mitad(fila.presupuestoAnual);
      resultado[1].gastado += mitad(fila.gastadoAnual);
      resultado[1].esEstimado = true;
      resultado[1].contribuciones.push({
        proyecto,
        presupuesto: mitad(fila.presupuestoAnual),
        gastado: mitad(fila.gastadoAnual),
        esEstimado: true,
      });
    }
  });

  resultado.forEach((s) =>
    s.contribuciones.sort((a, b) => b.presupuesto - a.presupuesto),
  );

  return resultado;
}
