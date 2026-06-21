import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  label: string;
  activo: boolean;
}

export default function SidebarLink({ href, label, activo }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={
        activo
          ? "block rounded-md bg-slate-700 px-4 py-3 text-sm text-white"
          : "block rounded-md px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
      }
    >
      {label}
    </Link>
  );
}