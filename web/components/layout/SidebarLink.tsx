import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  label: string;
  activo: boolean;
  contador?: number;
}

export default function SidebarLink({
  href,
  label,
  activo,
  contador,
}: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={
        activo
          ? "flex items-center justify-between rounded-md bg-slate-700 px-4 py-3 text-sm text-white"
          : "flex items-center justify-between rounded-md px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
      }
    >
      <span>{label}</span>
      {typeof contador === "number" && contador > 0 && (
        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
          {contador}
        </span>
      )}
    </Link>
  );
}
