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
  sincronizacionReal: boolean;
  sincronizarBC: () => Promise<void>;
}

const ProyectosContext = createContext<ProyectosContextValor | null>(null);

interface ActualizacionBC {
  codigo: string;
  ok: boolean;
  detalle: string;
  total?: number;
  mensual2026?: number[];
}

/**
 * Almacén de proyectos del portfolio, compartido por toda la
 * aplicación durante la sesión del navegador.
 *
 * sincronizarBC intenta primero una sincronización REAL con Business
 * Central (ruta /api/businesscentral/sincronizar). Si BC todavía no
 * está configurado (falta el acceso de IT), esa ruta lo indica
 * explícitamente y aquí se recurre a la simulación de siempre, para
 * no romper la experiencia mientras se espera el acceso.
 */
export function ProyectosProvider({ children }: { children: ReactNode }) {
  const [proyectos, setProyectos] = useState<Proyecto[]>(proyectosIniciales);
  const [cargando, setCargando] = useState(true);
  const [ultimaSincronizacion, setUltimaSincronizacion] =
    useState<Date | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [sincronizacionReal, setSincronizacionReal] = useState(false);

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
      // petición al servidor falle.
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

  const aplicarSimulacionBC = () => {
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
    setSincronizacionReal(false);
  };

  const aplicarSincronizacionRealBC = (actualizaciones: ActualizacionBC[]) => {
    setProyectos((actuales) =>
      actuales.map((proyecto) => {
        const actualizacion = actualizaciones.find(
          (a) => a.codigo === proyecto.codigo && a.ok,
        );
        if (!actualizacion || actualizacion.total === undefined) {
          return proyecto;
        }

        return {
          ...proyecto,
          importeGastado: actualizacion.total,
          etc: Math.max(0, proyecto.presupuestoAprobado - actualizacion.total),
          gastoMensual2026: actualizacion.mensual2026 ?? proyecto.gastoMensual2026,
        };
      }),
    );
    setSincronizacionReal(true);
  };

  const sincronizarBC = async () => {
    setSincronizando(true);

    try {
      const respuesta = await fetch("/api/businesscentral/sincronizar", {
        method: "POST",
      });
      const datos = await respuesta.json();

      if (datos.configurado) {
        aplicarSincronizacionRealBC(datos.actualizaciones ?? []);
      } else {
        // Business Central no está configurado todavía: simulación,
        // igual que antes de tener acceso.
        await new Promise((resolver) => setTimeout(resolver, 900));
        aplicarSimulacionBC();
      }
    } catch {
      // Si la ruta real falla por cualquier motivo, no dejamos al
      // usuario sin respuesta: recurrimos a la simulación.
      await new Promise((resolver) => setTimeout(resolver, 900));
      aplicarSimulacionBC();
    }

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
      sincronizacionReal,
      sincronizarBC,
    }),
    [proyectos, cargando, ultimaSincronizacion, sincronizando, sincronizacionReal],
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
