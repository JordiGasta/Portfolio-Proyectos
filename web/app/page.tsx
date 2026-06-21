type Project = {
  id: number;
  code: string;
  name: string;
  manager: string;
  phase: string;
  status: string;
  budget: number;
  spent: number;
  progress: number;
};

const projects: Project[] = [
  {
    id: 1,
    code: "CAPEX-2026-001",
    name: "Renovación de la línea de envasado",
    manager: "Ana Martínez",
    phase: "Ejecución",
    status: "En ejecución",
    budget: 450000,
    spent: 275000,
    progress: 62,
  },
  {
    id: 2,
    code: "CAPEX-2026-002",
    name: "Nueva instalación de refrigeración",
    manager: "Carlos López",
    phase: "Ingeniería",
    status: "Aprobado",
    budget: 320000,
    spent: 48000,
    progress: 25,
  },
  {
    id: 3,
    code: "CAPEX-2026-003",
    name: "Mejora del sistema de vapor",
    manager: "Laura Gómez",
    phase: "Definición",
    status: "En estudio",
    budget: 180000,
    spent: 12000,
    progress: 10,
  },
];

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function Home() {
  const totalBudget = projects.reduce(
    (total, project) => total + project.budget,
    0,
  );

  const totalSpent = projects.reduce(
    (total, project) => total + project.spent,
    0,
  );

  const activeProjects = projects.filter(
    (project) => project.status === "En ejecución",
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 bg-slate-900 p-6 text-white md:block">
          <h1 className="text-xl font-semibold">Portfolio</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestión de proyectos
          </p>

          <nav className="mt-10 space-y-2">
            <a
              href="#"
              className="block rounded-md bg-slate-700 px-4 py-3 text-sm"
            >
              Dashboard
            </a>

            <a
              href="#proyectos"
              className="block rounded-md px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Proyectos
            </a>

            <a
              href="#"
              className="block rounded-md px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Presupuesto
            </a>

            <a
              href="#"
              className="block rounded-md px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Riesgos
            </a>
          </nav>
        </aside>

        <section className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Portfolio de proyectos industriales
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Dashboard general
            </h2>

            <p className="mt-2 text-slate-600">
              Seguimiento económico, temporal y operativo de los proyectos.
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total de proyectos</p>
              <p className="mt-2 text-3xl font-bold">{projects.length}</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Proyectos en ejecución
              </p>
              <p className="mt-2 text-3xl font-bold">{activeProjects}</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Presupuesto aprobado
              </p>
              <p className="mt-2 text-2xl font-bold">
                {currencyFormatter.format(totalBudget)}
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Importe gastado</p>
              <p className="mt-2 text-2xl font-bold">
                {currencyFormatter.format(totalSpent)}
              </p>
            </article>
          </section>

          <section
            id="proyectos"
            className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold">Proyectos</h3>
                <p className="text-sm text-slate-500">
                  Relación de proyectos incluidos en el portfolio.
                </p>
              </div>

              <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Nuevo proyecto
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">Código</th>
                    <th className="px-5 py-3 font-medium">Proyecto</th>
                    <th className="px-5 py-3 font-medium">Responsable</th>
                    <th className="px-5 py-3 font-medium">Fase</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 font-medium">Presupuesto</th>
                    <th className="px-5 py-3 font-medium">Avance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium">
                        {project.code}
                      </td>

                      <td className="px-5 py-4">{project.name}</td>

                      <td className="px-5 py-4">{project.manager}</td>

                      <td className="px-5 py-4">{project.phase}</td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                          {project.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {currencyFormatter.format(project.budget)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full bg-slate-700"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>

                          <span>{project.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}