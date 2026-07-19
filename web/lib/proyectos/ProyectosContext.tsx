"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Proyecto } from "@/types/proyecto";
import { proyectos as proyectosIniciales } from "@/lib/data/proyectos";

interface ProyectosContextValor {
  proyectos: Proyecto[];
  cargando: boolean;
  agregarProyecto: (proyecto: Proyecto) => void;
  actualizarProyecto: (proyecto: Proyecto) => void;
  ultimaSincronizacion: Date | null;
  sincronizando: boolean;
  sincronizarBC: () => Promise<void>;
}

const ProyectosContext = createContext<ProyectosContextValor | null>(null);

/**
 * Almacén de proyectos del portfolio, compartido por toda la
 * aplicación durante la sesión del navegador.
 *
 * Al cargar la app, pide los proyectos a la ruta de API
 * "/api/proyectos" en lugar de leer directamente el array importado.
 * Esa ruta decide, en el servidor, si devuelve datos de SharePoint
 * (cuando esté configurado) o los datos ficticios (mientras no lo
 * esté) — el contexto no necesita saber cuál de los dos está usando.
 *
 * Si la petición a la API fallara por cualquier motivo, se usan los
 * datos ficticios locales como red de seguridad, para que la
 * aplicación nunca se quede sin datos que mostrar.
 */
export function ProyectosProvider({ children }: { children: ReactNode }) {
  const [proyectos, setProyectos] = useState<Proyecto[]>(proyectosIniciales);
  const [cargando, setCargando] = useState(true);
  const [ultimaSincronizacion, setUltimaSincronizacion] =
    useState<Date | null>(null);
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarProyectos() {
      try {
        const respuesta = await fetch("/api/proyectos", { cache: "no-store" });
        const datos = await respuesta.json();

        if (activo && Array.isArray(datos.proyectos)) {
          setProyectos(datos.proyectos);
        }
      } catch {
        // Si falla la petición, nos quedamos con los datos ficticios
        // locales con los que ya se inicializó el estado.
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarProyectos();

    return () => {
      activo = false;
    };
  }, []);

  const agregarProyecto = (proyecto: Proyecto) => {
    setProyectos((actuales) => [...actuales, proyecto]);

    fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proyecto),
    }).catch(() => {
      // El proyecto ya está reflejado en el estado local aunque la
      // petición al servidor falle; se mantiene la experiencia
      // previa de "todo en memoria" como red de seguridad.
    });
  };

  const actualizarProyecto = (proyecto: Proyecto) => {
    setProyectos((actuales) =>
      actuales.map((item) => (item.id === proyecto.id ? proyecto : item)),
    );

    fetch(`/api/proyectos/${proyecto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proyecto),
    }).catch(() => {
      // Igual que en agregarProyecto: el estado local ya refleja el
      // cambio aunque la petición al servidor falle.
    });
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
      cargando,
      agregarProyecto,
      actualizarProyecto,
      ultimaSincronizacion,
      sincronizando,
      sincronizarBC,
    }),
    [proyectos, cargando, ultimaSincronizacion, sincronizando],
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
