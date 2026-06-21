"use client";

import { usePathname } from "next/navigation";
import SidebarLink from "@/components/layout/SidebarLink";
import { useProyectos } from "@/lib/proyectos/ProyectosContext";
import { tieneGateVencido } from "@/lib/proyectos/calculos";
import { usuarioActual } from "@/lib/sesion";

interface EnlaceMenu {
  href: string;
  label: string;
}

const enlaces: EnlaceMenu[] = [
  { href: "/", label: "Resumen" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/cronograma", label: "Cronograma" },
  { href: "/demanda-capex", label: "Demanda CAPEX" },
  { href: "/seguimiento-gates", label: "Seguimiento de gates" },
  { href: "/informe-consejo", label: "Informe de consejo" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { proyectos } = useProyectos();
  const gatesVencidos = proyectos.filter(tieneGateVencido).length;

  return (
    <aside className="hidden w-64 flex-col bg-slate-900 text-white md:flex">
      <div className="p-6">
        <h1 className="text-xl font-semibold">Portfolio</h1>
        <p className="mt-1 text-sm text-slate-400">Gestión de proyectos</p>
      </div>

      <nav className="flex-1 space-y-2 px-6">
        {enlaces.map((enlace) => (
          <SidebarLink
            key={enlace.href}
            href={enlace.href}
            label={enlace.label}
            activo={
              enlace.href === "/"
                ? pathname === "/"
                : pathname.startsWith(enlace.href)
            }
            contador={
              enlace.href === "/seguimiento-gates" ? gatesVencidos : undefined
            }
          />
        ))}
      </nav>

      <div className="border-t border-slate-800 p-6">
        <p className="text-sm font-medium text-white">
          {usuarioActual.nombre}
        </p>
        <p className="text-xs text-slate-400">{usuarioActual.rol}</p>
      </div>
    </aside>
  );
}
