import { obtenerConfiguracionBC } from "@/lib/businesscentral/configuracion";

/**
 * Realiza una petición autenticada (Basic Auth) a la API interna de
 * Business Central de la empresa.
 */
export async function llamarBC(rutaConQuery: string): Promise<unknown> {
  const config = obtenerConfiguracionBC();
  if (!config) {
    throw new Error("La conexión con Business Central no está configurada.");
  }

  const credenciales = Buffer.from(
    `${config.usuario}:${config.contrasena}`,
  ).toString("base64");

  const respuesta = await fetch(`${config.baseUrl}${rutaConQuery}`, {
    headers: {
      Authorization: `Basic ${credenciales}`,
    },
    cache: "no-store",
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(
      `Error de la API de Business Central (${respuesta.status}): ${texto.slice(0, 200)}`,
    );
  }

  return respuesta.json();
}

/**
 * Convierte el código de proyecto de la app (formato "P022") al
 * formato que espera esta API interna (formato "P22", sin el cero
 * central).
 */
export function codigoParaBC(codigoApp: string): string {
  // El código de la app tiene 3 dígitos con cero inicial (P009,
  // P022...). La API interna de BC espera solo 2 dígitos (P09, P22),
  // es decir: se quita únicamente el primer dígito si es un "0" al
  // principio de los 3 números, no todos los ceros.
  const coincide = codigoApp.match(/^P(\d{3})$/i);
  if (coincide) {
    return `P${coincide[1].slice(1)}`;
  }
  return codigoApp;
}
