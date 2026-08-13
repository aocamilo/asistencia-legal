const VENTANA_MS = 10 * 60 * 1000;
const LIMITE_POR_VENTANA = 5;

type Registro = { intentos: number; iniciaEn: number };

// Estado en memoria por instancia de la función serverless. En Vercel esto
// mitiga abuso trivial pero no es una garantía global (cada instancia tiene
// su propio mapa). Suficiente para el volumen esperado; si el abuso crece,
// migrar a un store compartido (p. ej. Upstash Redis).
const registros = new Map<string, Registro>();

let ultimaLimpieza = Date.now();

function limpiarExpirados(ahora: number) {
  if (ahora - ultimaLimpieza < VENTANA_MS) return;
  ultimaLimpieza = ahora;
  for (const [clave, registro] of registros) {
    if (ahora - registro.iniciaEn > VENTANA_MS) {
      registros.delete(clave);
    }
  }
}

export function permitirSolicitud(identificador: string): boolean {
  const ahora = Date.now();
  limpiarExpirados(ahora);

  const registro = registros.get(identificador);

  if (!registro || ahora - registro.iniciaEn > VENTANA_MS) {
    registros.set(identificador, { intentos: 1, iniciaEn: ahora });
    return true;
  }

  if (registro.intentos >= LIMITE_POR_VENTANA) {
    return false;
  }

  registro.intentos += 1;
  return true;
}

export function obtenerIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headers.get("x-real-ip") ?? "desconocida";
}
