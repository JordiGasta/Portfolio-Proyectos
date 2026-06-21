"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Proyecto } from "@/types/proyecto";
import { proyectos as proyectosIniciales } from "@/lib/data/proyectos";

interface ProyectosContextValor {
  proyectos: Proyecto[];
  agregarProyecto: (proyecto: Proyecto) => void;
  actualizarProyecto: (proyecto: Proyecto) => void;
}

const ProyectosContext = createContext<ProyectosContextValor | null>(null);

/**
 * Almacén en memoria de los proyectos del portfolio, compartido por
 * toda la aplicación durante la sesión del navegador. No hay base de
 * datos: al recargar la página se vuelve a los datos ficticios
 * iniciales.
 */
export function ProyectosProvider({ children }: { children: ReactNode }) {
  const [proyectos, setProyectos] = useState<Proyecto[]>(proyectosIniciales);

  const agregarProyecto = (proyecto: Proyecto) => {
    setProyectos((actuales) => [...actuales, proyecto]);
  };

  const actualizarProyecto = (proyecto: Proyecto) => {
    setProyectos((actuales) =>
      actuales.map((item) => (item.id === proyecto.id ? proyecto : item)),
    );
  };

  const valor = useMemo(
    () => ({ proyectos, agregarProyecto, actualizarProyecto }),
    [proyectos],
  );

  return (
    <ProyectosContext.Provider value={valor}>
      {children}
    </ProyectosContext.Provider>
  );
}

export function useProyectos(): ProyectosContextValor {
  const contexto = useContext(ProyectosContext);

  if (!contexto) {
    throw new Error("useProyectos debe usarse dentro de ProyectosProvider");
  }

  return contexto;
}
