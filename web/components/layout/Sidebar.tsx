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

function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Sidebar() {
  const pathname = usePathname();
  const { proyectos, ultimaSincronizacion, sincronizando, sincronizarBC } =
    useProyectos();
  const gatesVencidos = proyectos.filter(tieneGateVencido).length;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col overflow-y-auto bg-slate-900 text-white md:flex">
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

      <div className="space-y-3 border-t border-slate-800 p-6">
        <div>
          <button
            type="button"
            onClick={sincronizarBC}
            disabled={sincronizando}
            className="w-full rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            {sincronizando ? "Sincronizando…" : "Sincronizar BC"}
          </button>
          <p className="mt-2 text-[11px] text-slate-500">
            {ultimaSincronizacion
              ? `Última sincronización: ${formatearHora(ultimaSincronizacion)}`
              : "Sin sincronizar todavía"}
          </p>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <p className="text-sm font-medium text-white">
            {usuarioActual.nombre}
          </p>
          <p className="text-xs text-slate-400">{usuarioActual.rol}</p>
        </div>
      </div>
    </aside>
  );
}
