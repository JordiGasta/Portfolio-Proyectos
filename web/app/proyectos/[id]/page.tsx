import { proyectos } from "@/lib/data/proyectos";
import FichaProyectoCliente from "@/components/proyectos/FichaProyectoCliente";

/**
 * Indica a Next.js qué identificadores de proyecto existen, para que
 * pueda generar el HTML estático de cada ficha al exportar la web.
 */
export function generateStaticParams() {
  return proyectos.map((proyecto) => ({ id: proyecto.id }));
}

export default async function PaginaFichaProyecto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FichaProyectoCliente id={id} />;
}
