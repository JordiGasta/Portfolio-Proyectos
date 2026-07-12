/**
 * Configuración de la conexión a SharePoint / Microsoft Graph.
 *
 * Se lee la información del portfolio desde un archivo Excel alojado
 * en un sitio de SharePoint (no de una lista). Todas las credenciales
 * se leen desde variables de entorno del servidor (nunca se envían
 * al navegador, nunca se escriben en el código ni en el
 * repositorio). Mientras no estén todas presentes, la app sigue
 * funcionando con datos locales.
 */
export interface ConfiguracionSharePoint {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  siteId: string;
  /** Ruta del archivo Excel dentro de la biblioteca de documentos del sitio, p.ej. "/CAPEX/CAPEX-plantilla.xlsx" */
  excelPath: string;
}

export function obtenerConfiguracionSharePoint(): ConfiguracionSharePoint | null {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const siteId = process.env.SHAREPOINT_SITE_ID;
  const excelPath = process.env.SHAREPOINT_EXCEL_PATH;

  if (!tenantId || !clientId || !clientSecret || !siteId || !excelPath) {
    return null;
  }

  return { tenantId, clientId, clientSecret, siteId, excelPath };
}

export function sharePointEstaConfigurado(): boolean {
  return obtenerConfiguracionSharePoint() !== null;
}
