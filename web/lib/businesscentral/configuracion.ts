/**
 * Configuración de la conexión a la API interna de Business Central
 * de la empresa (no es la API estándar de Microsoft, es un servidor
 * propio con autenticación Basic Auth).
 */
export interface ConfiguracionBC {
  baseUrl: string;
  usuario: string;
  contrasena: string;
}

export function obtenerConfiguracionBC(): ConfiguracionBC | null {
  const baseUrl = process.env.BC_API_BASE_URL;
  const usuario = process.env.BC_API_USER;
  const contrasena = process.env.BC_API_PASSWORD;

  if (!baseUrl || !usuario || !contrasena) {
    return null;
  }

  return { baseUrl, usuario, contrasena };
}

export function businessCentralEstaConfigurado(): boolean {
  return obtenerConfiguracionBC() !== null;
}
