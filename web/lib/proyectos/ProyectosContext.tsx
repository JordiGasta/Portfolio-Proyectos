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
  ultimaSincronizacion: Date | null;
  sincronizando: boolean;
  sincronizarBC: () => Promise<void>;
}

const ProyectosContext = createContext<ProyectosContextValor | null>(null);

/**
 * Almacén en memoria de los proyectos del portfolio, compartido por
 * toda la aplicación durante la sesión del navegador. No hay base de
 * datos: al recargar la página se vuelve a los datos ficticios
 * iniciales.
 *
 * sincronizarBC simula el botón "Sync BC" del documento de
 * requisitos: no hay conexión real a Business Central, solo se
 * simula un pequeño retraso y un ajuste ficticio de los importes
 * gastados de los proyectos vinculados a un Job de BC
 * (numeroJobBC distinto de null).
 */
export function ProyectosProvider({ children }: { children: ReactNode }) {
  const [proyectos, setProyectos] = useState<Proyecto[]>(proyectosIniciales);
  const [ultimaSincronizacion, setUltimaSincronizacion] =
    useState<Date | null>(null);
  const [sincronizando, setSincronizando] = useState(false);

  const agregarProyecto = (proyecto: Proyecto) => {
    setProyectos((actuales) => [...actuales, proyecto]);
  };

  const actualizarProyecto = (proyecto: Proyecto) => {
    setProyectos((actuales) =>
      actuales.map((item) => (item.id === proyecto.id ? proyecto : item)),
    );
  };

  const sincronizarBC = async () => {
    setSincronizando(true);

    await new Promise((resolver) => setTimeout(resolver, 900));

    setProyectos((actuales) =>
      actuales.map((proyecto) => {
        if (!proyecto.numeroJobBC) {
          return proyecto;
        }

        const incrementoMaximo = proyecto.presupuestoAprobado * 0.015;
        const incremento = Math.round(Math.random() * incrementoMaximo);
        const nuevoGastado = Math.min(
          proyecto.importeGastado + incremento,
          proyecto.presupuestoAprobado + proyecto.etc,
        );

        return { ...proyecto, importeGastado: nuevoGastado };
      }),
    );

    setUltimaSincronizacion(new Date());
    setSincronizando(false);
  };

  const valor = useMemo(
    () => ({
      proyectos,
      agregarProyecto,
      actualizarProyecto,
      ultimaSincronizacion,
      sincronizando,
      sincronizarBC,
    }),
    [proyectos, ultimaSincronizacion, sincronizando],
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
