import { NextResponse } from "next/server";
import {
  businessCentralEstaConfigurado,
  obtenerConfiguracionBC,
} from "@/lib/businesscentral/configuracion";
import { llamarBusinessCentral } from "@/lib/businesscentral/bcClient";

/**
 * Ruta temporal de diagnóstico, equivalente a /api/sharepoint/columnas.
 * Comprueba que la conexión con Business Central funciona y muestra
 * un ejemplo de asiento de coste (jobLedgerEntries), para verificar
 * los nombres de campos reales antes de conectar los datos a la app.
 *
 * Borrar esta ruta una vez completada la integración.
 */
export async function GET() {
  if (!businessCentralEstaConfigurado()) {
    return NextResponse.json({
      configurado: false,
      aviso:
        "Business Central no está configurado todavía. Rellena BC_ENVIRONMENT y BC_COMPANY_ID en .env.local cuando IT conceda el acceso.",
    });
  }

  const config = obtenerConfiguracionBC()!;

  try {
    // 1) Comprobar que se puede listar la empresa configurada.
    const empresas = (await llamarBusinessCentral(`/companies`)) as {
      value: Array<{ id: string; name: string; displayName: string }>;
    };

    // 2) Traer una muestra pequeña de asientos de coste, para ver los
    //    nombres de campo reales.
    const muestra = (await llamarBusinessCentral(
      `/companies(${config.companyId})/jobLedgerEntries?$top=3`,
    )) as { value: unknown[] };

    return NextResponse.json({
      configurado: true,
      empresasDisponibles: empresas.value,
      muestraJobLedgerEntries: muestra.value,
    });
  } catch (error) {
    return NextResponse.json(
      {
        configurado: true,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
