import { obtenerConfiguracionSharePoint } from "@/lib/sharepoint/configuracion";

interface TokenCache {
  token: string;
  expiraEn: number;
}

let cacheToken: TokenCache | null = null;

/**
 * Obtiene un token de acceso de Microsoft Graph usando el flujo de
 * credenciales de cliente (aplicación a aplicación, sin usuario
 * interactivo). El token se cachea en memoria del servidor durante
 * su periodo de validez para no pedir uno nuevo en cada petición.
 */
async function obtenerTokenAcceso(): Promise<string> {
  const config = obtenerConfiguracionSharePoint();

  if (!config) {
    throw new Error(
      "SharePoint no está configurado: faltan variables de entorno.",
    );
  }

  if (cacheToken && cacheToken.expiraEn > Date.now()) {
    return cacheToken.token;
  }

  const url = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;

  const cuerpo = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const respuesta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: cuerpo.toString(),
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(`No se ha podido obtener el token de Graph: ${texto}`);
  }

  const datos = await respuesta.json();

  cacheToken = {
    token: datos.access_token,
    expiraEn: Date.now() + (datos.expires_in - 60) * 1000,
  };

  return cacheToken.token;
}

/**
 * Realiza una petición autenticada a Microsoft Graph API.
 */
export async function llamarGraph(
  ruta: string,
  opciones: RequestInit = {},
): Promise<unknown> {
  const token = await obtenerTokenAcceso();

  const respuesta = await fetch(`https://graph.microsoft.com/v1.0${ruta}`, {
    ...opciones,
    headers: {
      ...opciones.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(`Error de Microsoft Graph (${respuesta.status}): ${texto}`);
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
}
