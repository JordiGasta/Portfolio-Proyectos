"use client";

import { usePathname } from "next/navigation";
import SidebarLink from "@/components/layout/SidebarLink";

interface EnlaceMenu {
  href: string;
  label: string;
  disponible: boolean;
}

const enlaces: EnlaceMenu[] = [
  { href: "/", label: "Dashboard", disponible: true },
  { href: "/proyectos", label: "Proyectos", disponible: true },
  { href: "/presupuesto", label: "Presupuesto", disponible: false },
  { href: "/riesgos", label: "Riesgos", disponible: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 bg-slate-900 p-6 text-white md:block">
      <h1 className="text-xl font-semibold">Portfolio</h1>
      <p className="mt-1 text-sm text-slate-400">Gestión de proyectos</p>

      <nav className="mt-10 space-y-2">
        {enlaces.map((enlace) =>
          enlace.disponible ? (
            <SidebarLink
              key={enlace.href}
              href={enlace.href}
              label={enlace.label}
              activo={
                enlace.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(enlace.href)
              }
            />
          ) : (
            <span
              key={enlace.href}
              className="block cursor-not-allowed rounded-md px-4 py-3 text-sm text-slate-500"
              title="Próximamente disponible"
            >
              {enlace.label}
            </span>
          ),
        )}
      </nav>
    </aside>
  );
}