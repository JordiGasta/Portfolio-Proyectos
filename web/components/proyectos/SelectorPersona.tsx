"use client";

import { useEffect, useRef, useState } from "react";

interface UsuarioM365 {
  id: string;
  nombre: string;
  correo: string;
}

interface SelectorPersonaProps {
  etiqueta: string;
  valor: string;
  onCambiar: (valor: string) => void;
  obligatorio?: boolean;
}

/**
 * Campo para indicar una persona (Sponsor / Project Manager).
 *
 * Si la búsqueda en el directorio de Microsoft 365 está disponible
 * (credenciales de Graph configuradas), muestra sugerencias reales
 * mientras se escribe. Si no está disponible todavía, se comporta
 * como un campo de texto libre normal, sin romper el flujo de
 * creación/edición de proyectos.
 */
export default function SelectorPersona({
  etiqueta,
  valor,
  onCambiar,
  obligatorio = false,
}: SelectorPersonaProps) {
  const [sugerencias, setSugerencias] = useState<UsuarioM365[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [autocompletadoDisponible, setAutocompletadoDisponible] = useState(true);
  const referenciaContenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autocompletadoDisponible || valor.trim().length < 2) {
      setSugerencias([]);
      return;
    }

    const controlador = new AbortController();
    const temporizador = setTimeout(async () => {
      try {
        const respuesta = await fetch(
          `/api/usuarios?q=${encodeURIComponent(valor.trim())}`,
          { signal: controlador.signal },
        );
        const datos = await respuesta.json();

        if (datos.origen === "ficticio") {
          // Sin credenciales de Graph configuradas: desactivamos el
          // autocompletado para no seguir consultando en vano.
          setAutocompletadoDisponible(false);
          setSugerencias([]);
          return;
        }

        setSugerencias(datos.usuarios ?? []);
      } catch {
        // Error de red o petición cancelada: no hacemos nada, el
        // campo sigue funcionando como texto libre.
      }
    }, 300);

    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [valor, autocompletadoDisponible]);

  useEffect(() => {
    function manejarClicFuera(evento: MouseEvent) {
      if (
        referenciaContenedor.current &&
        !referenciaContenedor.current.contains(evento.target as Node)
      ) {
        setMostrarSugerencias(false);
      }
    }

    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, []);

  return (
    <div ref={referenciaContenedor} className="relative">
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {etiqueta}
        {!autocompletadoDisponible && (
          <span className="ml-1 text-slate-400">(texto libre)</span>
        )}
      </label>
      <input
        type="text"
        required={obligatorio}
        value={valor}
        onChange={(evento) => {
          onCambiar(evento.target.value);
          setMostrarSugerencias(true);
        }}
        onFocus={() => setMostrarSugerencias(true)}
        placeholder={
          autocompletadoDisponible
            ? "Escribe un nombre para buscar en el directorio…"
            : undefined
        }
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />

      {mostrarSugerencias && sugerencias.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          {sugerencias.map((usuario) => (
            <li key={usuario.id}>
              <button
                type="button"
                onClick={() => {
                  onCambiar(usuario.nombre);
                  setMostrarSugerencias(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{usuario.nombre}</span>
                <span className="ml-2 text-xs text-slate-500">{usuario.correo}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
