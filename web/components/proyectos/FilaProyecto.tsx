import Link from "next/link";
import type { Proyecto } from "@/types/proyecto";
import EstadoBadge from "@/components/proyectos/EstadoBadge";
import BarraAvance from "@/components/proyectos/BarraAvance";
import { formatearEuros } from "@/lib/format/formato";

interface FilaProyectoProps {
  proyecto: Proyecto;
}

export default function FilaProyecto({ proyecto }: FilaProyectoProps) {
  return (
    <tr className="cursor-pointer hover:bg-slate-50">
      <td className="px-5 py-4 font-medium">
        <Link href={`/proyectos/${proyecto.id}`} className="block focus:outline-none">
          {proyecto.codigo}
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link href={`/proyectos/${proyecto.id}`} className="block">
          {proyecto.nombre}
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link href={`/proyectos/${proyecto.id}`} className="block">
          {proyecto.responsable}
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link href={`/proyectos/${proyecto.id}`} className="block">
          {proyecto.fase}
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link href={`/proyectos/${proyecto.id}`} className="block">
          <EstadoBadge estado={proyecto.estado} />
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link href={`/proyectos/${proyecto.id}`} className="block">
          {formatearEuros(proyecto.presupuestoAprobado)}
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link href={`/proyectos/${proyecto.id}`} className="block">
          <BarraAvance porcentaje={proyecto.avance} />
        </Link>
      </td>
    </tr>
  );
}