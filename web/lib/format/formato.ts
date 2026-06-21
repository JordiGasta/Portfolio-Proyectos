const formateadorEuros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const formateadorFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatearEuros(importe: number): string {
  return formateadorEuros.format(importe);
}

export function formatearFecha(fechaIso: string): string {
  const fecha = new Date(`${fechaIso}T00:00:00`);

  if (Number.isNaN(fecha.getTime())) {
    return fechaIso;
  }

  return formateadorFecha.format(fecha);
}

export function formatearPorcentaje(valor: number): string {
  return `${valor} %`;
}

/**
 * Extrae la parte corta de una etiqueta de fase, p. ej.
 * "Fase IIB — Ingeniería básica solución escogida" -> "Fase IIB".
 */
export function obtenerCodigoFaseCorto(fase: string): string {
  return fase.split("—")[0].trim();
}
