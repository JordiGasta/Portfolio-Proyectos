import { NextResponse } from "next/server";
import {
  obtenerConfiguracionSharePoint,
  sharePointEstaConfigurado,
} from "@/lib/sharepoint/configuracion";
import { llamarGraph } from "@/lib/sharepoint/graphClient";

export interface UsuarioM365 {
  id: string;
  nombre: string;
  correo: string;
}

interface RespuestaGraphUsuarios {
  value: Array<{
    id: string;
    displayName: string;
    mail: string | null;
    userPrincipalName: string;
  }>;
}

/**
 * Busca personas reales del directorio de Microsoft 365 (vía Graph),
 * usadas en el selector de Sponsor / Project Manager.
 *
 * Si las credenciales de Microsoft Graph no están configuradas
 * todavía, devuelve un array vacío con "origen: ficticio"; el
 * componente del frontend interpreta esto como "no hay autocompletado
 * disponible" y se comporta como un campo de texto libre normal.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const consulta = (searchParams.get("q") ?? "").trim();

  if (!sharePointEstaConfigurado()) {
    return NextResponse.json({ origen: "ficticio", usuarios: [] });
  }

  if (consulta.length < 2) {
    return NextResponse.json({ origen: "sharepoint", usuarios: [] });
  }

  try {
    const config = obtenerConfiguracionSharePoint();
    void config; // las credenciales se usan dentro de llamarGraph

    const filtro = `startswith(displayName,'${consulta.replace(/'/g, "''")}')`;
    const datos = (await llamarGraph(
      `/users?$filter=${encodeURIComponent(filtro)}&$select=id,displayName,mail,userPrincipalName&$top=10`,
    )) as RespuestaGraphUsuarios;

    const usuarios: UsuarioM365[] = datos.value.map((usuario) => ({
      id: usuario.id,
      nombre: usuario.displayName,
      correo: usuario.mail ?? usuario.userPrincipalName,
    }));

    return NextResponse.json({ origen: "sharepoint", usuarios });
  } catch (error) {
    return NextResponse.json({
      origen: "error",
      mensaje: error instanceof Error ? error.message : "Error desconocido.",
      usuarios: [],
    });
  }
}
