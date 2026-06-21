import Sidebar from "@/components/layout/Sidebar";

interface PaginaEnConstruccionProps {
  titulo: string;
  descripcion: string;
}

export default function PaginaEnConstruccion({
  titulo,
  descripcion,
}: PaginaEnConstruccionProps) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Portfolio de proyectos industriales
            </p>

            <h2 className="mt-2 text-3xl font-bold">{titulo}</h2>

            <p className="mt-2 text-slate-600">{descripcion}</p>
          </header>

          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Esta vista está en construcción. Se implementará en un
            próximo incremento.
          </div>
        </section>
      </div>
    </main>
  );
}
