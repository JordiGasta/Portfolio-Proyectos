import { promises as fs } from "fs";
import path from "path";
import { proyectos as proyectosFicticios } from "@/lib/data/proyectos";
import type { Proyecto } from "@/types/proyecto";

/**
 * Almacén de proyectos persistido en un archivo del propio
 * Codespace, usado SOLO mientras SharePoint no esté configurado.
 *
 * No es una base de datos real: es un archivo plano (JSON) en disco,
 * pensado únicamente como sustituto temporal de "memoria del
 * navegador" para que los datos sobrevivan a recargas de página
 * durante el desarrollo, sin necesitar todavía la conexión real a
 * SharePoint. Se reinicia si se borra el archivo o el Codespace, y
 * nunca se sube al repositorio (está en .gitignore).
 */
const RUTA_ARCHIVO = path.join(process.cwd(), ".datos-dev", "proyectos.json");

async function asegurarArchivo(): Promise<void> {
  try {
    await fs.access(RUTA_ARCHIVO);
  } catch {
    await fs.mkdir(path.dirname(RUTA_ARCHIVO), { recursive: true });
    await fs.writeFile(
      RUTA_ARCHIVO,
      JSON.stringify(proyectosFicticios, null, 2),
      "utf-8",
    );
  }
}

export async function leerProyectosLocales(): Promise<Proyecto[]> {
  await asegurarArchivo();
  const contenido = await fs.readFile(RUTA_ARCHIVO, "utf-8");
  return JSON.parse(contenido) as Proyecto[];
}

export async function guardarProyectosLocales(
  proyectos: Proyecto[],
): Promise<void> {
  await asegurarArchivo();
  await fs.writeFile(RUTA_ARCHIVO, JSON.stringify(proyectos, null, 2), "utf-8");
}
