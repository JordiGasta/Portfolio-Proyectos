/**
 * Configuración de la conexión a SharePoint / Microsoft Graph.
 *
 * Todas las credenciales se leen desde variables de entorno del
 * servidor (nunca se envían al navegador, nunca se escriben en el
 * código ni en el repositorio). Mientras no estén todas presentes,
 * la app sigue funcionando con datos ficticios.
 */
export interface ConfiguracionSharePoint {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  siteId: string;
  listId: string;
}

export function obtenerConfiguracionSharePoint(): ConfiguracionSharePoint | null {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const siteId = process.env.SHAREPOINT_SITE_ID;
  const listId = process.env.SHAREPOINT_LIST_ID;

  if (!tenantId || !clientId || !clientSecret || !siteId || !listId) {
    return null;
  }

  return { tenantId, clientId, clientSecret, siteId, listId };
}

export function sharePointEstaConfigurado(): boolean {
  return obtenerConfiguracionSharePoint() !== null;
}
