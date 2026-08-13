import { NextResponse } from "next/server";
import { solicitudSchema } from "@/lib/schema";
import { enviarSolicitud } from "@/lib/apps-script";
import { obtenerIp, permitirSolicitud } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const TAMANO_MAXIMO_BYTES = 32 * 1024;
const TIEMPO_MINIMO_MS = 3000;

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

// Respuesta genérica para bots: no revela por qué falló, para no darles
// una señal que les permita ajustar el ataque.
function respuestaTrampa() {
  return json({ ok: true }, 200);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return json({ ok: false, error: "Solicitud inválida" }, 400);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > TAMANO_MAXIMO_BYTES) {
    return json({ ok: false, error: "Solicitud demasiado grande" }, 413);
  }

  const ip = obtenerIp(request.headers);
  if (!permitirSolicitud(ip)) {
    return json(
      { ok: false, error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." },
      429,
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ ok: false, error: "Solicitud inválida" }, 400);
  }

  if (typeof cuerpo !== "object" || cuerpo === null) {
    return json({ ok: false, error: "Solicitud inválida" }, 400);
  }

  const datos = cuerpo as Record<string, unknown>;

  // Honeypot: un campo oculto que solo un bot llenaría.
  if (typeof datos.sitioWeb === "string" && datos.sitioWeb.trim() !== "") {
    return respuestaTrampa();
  }

  // Un humano tarda más de unos segundos en completar el formulario.
  const marcaTiempo = typeof datos._t === "number" ? datos._t : 0;
  if (Date.now() - marcaTiempo < TIEMPO_MINIMO_MS) {
    return respuestaTrampa();
  }

  const resultado = solicitudSchema.safeParse(cuerpo);
  if (!resultado.success) {
    return json(
      { ok: false, error: "Revisa los campos del formulario", campos: resultado.error.flatten().fieldErrors },
      400,
    );
  }

  const { sitioWeb, _t, ...datosParaEnviar } = resultado.data;
  void sitioWeb;
  void _t;

  const respuesta = await enviarSolicitud(datosParaEnviar);

  if (!respuesta.ok) {
    console.error("No se pudo registrar la solicitud en Apps Script");
    return json(
      { ok: false, error: "No pudimos guardar tu solicitud. Intenta de nuevo en unos minutos." },
      502,
    );
  }

  return json({ ok: true, folio: respuesta.folio }, 201);
}

export async function GET() {
  return json({ ok: false, error: "Método no permitido" }, 405);
}
