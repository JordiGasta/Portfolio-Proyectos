import type { Proyecto } from "@/types/proyecto";
import {
  calcularEAC,
  calcularProgresionGates,
  calcularVariacionPorcentual,
  ordenFases,
} from "@/lib/proyectos/calculos";
import { formatearEuros, formatearFecha } from "@/lib/format/formato";

export async function generarGateReviewDocx(proyecto: Proyecto): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
  } = await import("docx");

  const eac = calcularEAC(proyecto);
  const variacion = calcularVariacionPorcentual(proyecto);
  const progresionGates = calcularProgresionGates(proyecto);

  const celda = (texto: string, negrita = false) =>
    new TableCell({
      width: { size: 50, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          children: [new TextRun({ text: texto, bold: negrita })],
        }),
      ],
    });

  const filaDatos = (etiqueta: string, valor: string) =>
    new TableRow({ children: [celda(etiqueta, true), celda(valor)] });

  const tablaDatosGenerales = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      filaDatos("Código", proyecto.codigo),
      filaDatos("Responsable / Project Manager", proyecto.responsable),
      filaDatos("Sponsor", proyecto.sponsor),
      filaDatos("Propietario", proyecto.propietario || "—"),
      filaDatos("Departamento", proyecto.departamento),
      filaDatos("Categoría estratégica", proyecto.categoria),
      filaDatos("Objetivo estratégico", proyecto.objetivoEstrategico),
      filaDatos("Fase actual", proyecto.fase),
      filaDatos("Rigurosidad", proyecto.rigurosidad),
      filaDatos("Estado", proyecto.estado),
    ],
  });

  const tablaEconomica = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      filaDatos("Presupuesto aprobado", formatearEuros(proyecto.presupuestoAprobado)),
      filaDatos("Importe comprometido", formatearEuros(proyecto.importeComprometido)),
      filaDatos("Actuals (gastado)", formatearEuros(proyecto.importeGastado)),
      filaDatos("ETC", formatearEuros(proyecto.etc)),
      filaDatos("EAC", formatearEuros(eac)),
      filaDatos("Variación", `${variacion}%`),
    ],
  });

  const celdaTripe = (texto: string, negrita = false) =>
    new TableCell({
      width: { size: 33, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          children: [new TextRun({ text: texto, bold: negrita })],
        }),
      ],
    });

  const filasFases = ordenFases
    .map((fase) => ({ fase, detalle: proyecto.detallePorFase[fase] }))
    .filter((item) => item.detalle)
    .map(
      (item) =>
        new TableRow({
          children: [
            celdaTripe(item.fase),
            celdaTripe(
              item.detalle?.coste !== undefined
                ? formatearEuros(item.detalle.coste)
                : "—",
            ),
            celdaTripe(
              item.detalle?.fechaInicio && item.detalle?.fechaFin
                ? `${formatearFecha(item.detalle.fechaInicio)} - ${formatearFecha(item.detalle.fechaFin)}`
                : "—",
            ),
          ],
        }),
    );

  const tablaFases = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          celdaTripe("Fase", true),
          celdaTripe("Coste estimado", true),
          celdaTripe("Periodo", true),
        ],
      }),
      ...filasFases,
    ],
  });

  const textoProgresion = progresionGates
    .map((item) => `${item.gate} (${item.estado})`)
    .join("   →   ");

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Paquete de revisión de gate", heading: HeadingLevel.TITLE }),
          new Paragraph({ text: `${proyecto.codigo} — ${proyecto.nombre}`, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            text: `Generado el ${formatearFecha(new Date().toISOString().slice(0, 10))}`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: "Datos generales", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
          tablaDatosGenerales,
          new Paragraph({ text: "Seguimiento económico", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
          tablaEconomica,
          new Paragraph({ text: "Progresión de gates", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
          new Paragraph({ text: textoProgresion }),
          new Paragraph({ text: "Desglose de costes por fase", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
          tablaFases,
          new Paragraph({ text: "Descripción", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
          new Paragraph({ text: proyecto.descripcion }),
          new Paragraph({ text: "Observaciones", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
          new Paragraph({ text: proyecto.observaciones || "Sin observaciones." }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `Gate-Review-${proyecto.codigo}.docx`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
