import type { Proyecto } from "@/types/proyecto";

/**
 * Genera el siguiente identificador de proyecto en formato P-AAAA-NN,
 * usando el año actual y el siguiente número de secuencia disponible
 * para ese año entre los proyectos existentes.
 */
export function generarIdentificadorProyecto(proyectos: Proyecto[]): string {
  const anio = new Date().getFullYear();
  const prefijo = `P-${anio}-`;

  const numeros = proyectos
    .map((proyecto) => proyecto.id)
    .filter((id) => id.startsWith(prefijo))
    .map((id) => Number.parseInt(id.slice(prefijo.length), 10))
    .filter((numero) => !Number.isNaN(numero));

  const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
  return `${prefijo}${String(siguiente).padStart(2, "0")}`;
}
