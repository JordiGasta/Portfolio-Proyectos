import { obtenerConfiguracionBC } from "@/lib/businesscentral/configuracion";

interface TokenCacheBC {
  token: string;
  expiraEn: number;
}

let cacheTokenBC: TokenCacheBC | null = null;

/**
 * Obtiene un token de acceso a la API de Business Central usando el
 * flujo de credenciales de cliente (igual que con Microsoft Graph,
 * pero con el ámbito de Business Central en vez de Graph).
 */
async function obtenerTokenAccesoBC(): Promise<string> {
  const config = obtenerConfiguracionBC();

  if (!config) {
    throw new Error(
      "Business Central no está configurado: faltan variables de entorno.",
    );
  }

  if (cacheTokenBC && cacheTokenBC.expiraEn > Date.now()) {
    return cacheTokenBC.token;
  }

  const url = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;

  const cuerpo = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: "https://api.businesscentral.dynamics.com/.default",
    grant_type: "client_credentials",
  });

  const respuesta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: cuerpo.toString(),
    cache: "no-store",
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(`No se ha podido obtener el token de Business Central: ${texto}`);
  }

  const datos = await respuesta.json();

  cacheTokenBC = {
    token: datos.access_token,
    expiraEn: Date.now() + (datos.expires_in - 60) * 1000,
  };

  return cacheTokenBC.token;
}

/**
 * Realiza una petición autenticada a la API v2.0 de Business Central.
 */
export async function llamarBusinessCentral(ruta: string): Promise<unknown> {
  const config = obtenerConfiguracionBC();
  if (!config) {
    throw new Error("Business Central no está configurado.");
  }

  const token = await obtenerTokenAccesoBC();
  const base = `https://api.businesscentral.dynamics.com/v2.0/${config.tenantId}/${config.entorno}/api/v2.0`;

  const respuesta = await fetch(`${base}${ruta}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(`Error de Business Central (${respuesta.status}): ${texto}`);
  }

  return respuesta.json();
}
