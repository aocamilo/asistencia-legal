import type { Solicitud } from "./schema";

type DatosEnvio = Omit<Solicitud, "sitioWeb" | "_t">;

type RespuestaAppsScript = { ok: true; folio: string } | { ok: false };

function generarFolioLocal(): string {
  const fecha = new Date();
  const yyyymmdd = fecha.toISOString().slice(0, 10).replace(/-/g, "");
  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AL-${yyyymmdd}-${sufijo}`;
}

/**
 * Envía la solicitud al Apps Script que la guarda en Google Sheets y notifica
 * por correo. Si APPS_SCRIPT_URL no está configurada (típico en desarrollo
 * local para colaboradores sin acceso a la hoja de Google), opera en modo
 * "dry-run": registra la solicitud en consola y responde con un folio de
 * prueba, sin hacer ninguna llamada de red.
 */
export async function enviarSolicitud(
  datos: DatosEnvio,
): Promise<RespuestaAppsScript> {
  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;

  if (!url || !token) {
    const folio = generarFolioLocal();
    console.info(
      `[dry-run] APPS_SCRIPT_URL no configurada. Solicitud ${folio} no se envió a Google Sheets.`,
    );
    return { ok: true, folio };
  }

  try {
    const respuesta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...datos, token }),
      // Apps Script puede tardar en arrancar en frío (15-20s+); 10s lo
      // cortaba a mitad de camino y producía 502 en solicitudes válidas.
      signal: AbortSignal.timeout(25_000),
    });

    if (!respuesta.ok) {
      console.error(`Apps Script respondió con estado ${respuesta.status}`);
      return { ok: false };
    }

    const cuerpo = (await respuesta.json()) as RespuestaAppsScript;
    return cuerpo;
  } catch (error) {
    console.error(
      "No se pudo contactar Apps Script:",
      error instanceof Error ? error.message : "error desconocido",
    );
    return { ok: false };
  }
}
