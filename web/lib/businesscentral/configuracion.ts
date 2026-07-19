/**
 * Configuración de la conexión a Business Central.
 *
 * Se reutiliza la misma aplicación de Azure AD que para SharePoint
 * (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET), ya que es
 * habitual usar el mismo registro para varias APIs de Microsoft. Si
 * IT prefiere una aplicación separada solo para BC, basta con
 * cambiar estas tres variables por unas específicas.
 *
 * Además de los permisos de Azure AD, Business Central normalmente
 * exige dar de alta la aplicación como "Application User" dentro del
 * propio BC, con un conjunto de permisos asignado.
 */
export interface ConfiguracionBusinessCentral {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  /** Nombre del entorno de BC, p. ej. "production" o "sandbox". */
  entorno: string;
  /** ID de la empresa dentro de Business Central sobre la que consultar. */
  companyId: string;
}

export function obtenerConfiguracionBC(): ConfiguracionBusinessCentral | null {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const entorno = process.env.BC_ENVIRONMENT;
  const companyId = process.env.BC_COMPANY_ID;

  if (!tenantId || !clientId || !clientSecret || !entorno || !companyId) {
    return null;
  }

  return { tenantId, clientId, clientSecret, entorno, companyId };
}

export function businessCentralEstaConfigurado(): boolean {
  return obtenerConfiguracionBC() !== null;
}
