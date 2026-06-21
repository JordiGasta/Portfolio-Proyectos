import type { Proyecto } from "@/types/proyecto";
import type { FiltrosProyectosValor } from "@/components/proyectos/FiltrosProyectos";

/**
 * Aplica los filtros de texto, estado, fase y departamento sobre una
 * lista de proyectos. Es una función pura: no modifica el array
 * recibido y no depende de estado externo.
 */
export function filtrarProyectos(
  proyectos: Proyecto[],
  filtros: FiltrosProyectosValor,
): Proyecto[] {
  const texto = filtros.texto.trim().toLowerCase();

  return proyectos.filter((proyecto) => {
    const coincideTexto =
      texto === "" ||
      proyecto.codigo.toLowerCase().includes(texto) ||
      proyecto.nombre.toLowerCase().includes(texto);

    const coincideEstado =
      filtros.estado === "Todos" || proyecto.estado === filtros.estado;

    const coincideFase =
      filtros.fase === "Todas" || proyecto.fase === filtros.fase;

    const coincideDepartamento =
      filtros.departamento === "Todos" ||
      proyecto.departamento === filtros.departamento;

    return (
      coincideTexto && coincideEstado && coincideFase && coincideDepartamento
    );
  });
}
