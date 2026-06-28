import type { Proyecto } from "@/types/proyecto";
import type { FiltrosProyectosValor } from "@/components/proyectos/FiltrosProyectos";

export function filtrarProyectos(
  proyectos: Proyecto[],
  filtros: FiltrosProyectosValor,
): Proyecto[] {
  return proyectos.filter((proyecto) => {
    const coincideFase = filtros.fase === "Todas" || proyecto.fase === filtros.fase;
    const coincideCategoria =
      filtros.categoria === "Todas" || proyecto.categoria === filtros.categoria;
    const coincideEstado =
      filtros.estado === "Todos" || proyecto.estado === filtros.estado;

    return coincideFase && coincideCategoria && coincideEstado;
  });
}
