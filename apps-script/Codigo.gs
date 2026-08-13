/**
 * Recibe solicitudes de asesoría jurídica desde el formulario web, las guarda
 * en la hoja "Solicitudes" y notifica por correo al equipo coordinador.
 *
 * Este archivo no contiene secretos: SHARED_TOKEN y DESTINATARIOS se
 * configuran como Propiedades del script (Project Settings → Script
 * Properties), nunca en este código. Ver apps-script/README.md para la guía
 * de despliegue paso a paso.
 */

const NOMBRE_HOJA = "Solicitudes";

const ENCABEZADOS = [
  "Fecha",
  "Folio",
  "Nombre",
  "Teléfono",
  "Correo",
  "Canal preferido",
  "Departamento",
  "Municipio",
  "Barrio o vereda",
  "Tipo de ayuda",
  "Descripción",
  "Urgencia",
  "Personas afectadas",
  "Condición especial",
  "Ya tiene abogado",
  "Estado",
  "Abogado asignado",
];

function doPost(e) {
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(10000);

  try {
    const cuerpo = JSON.parse(e.postData.contents);

    const tokenEsperado = PropertiesService.getScriptProperties().getProperty("SHARED_TOKEN");
    if (!tokenEsperado || cuerpo.token !== tokenEsperado) {
      return responderJson({ ok: false });
    }

    const hoja = obtenerHoja();
    const folio = generarFolio(hoja);

    hoja.appendRow([
      new Date(),
      folio,
      cuerpo.nombre || "",
      cuerpo.telefono || "",
      cuerpo.email || "",
      cuerpo.canalPreferido || "",
      cuerpo.departamento || "",
      cuerpo.municipio || "",
      cuerpo.barrioVereda || "",
      Array.isArray(cuerpo.tipoAyuda) ? cuerpo.tipoAyuda.join(", ") : "",
      cuerpo.descripcion || "",
      cuerpo.urgencia || "",
      cuerpo.personasAfectadas || "",
      Array.isArray(cuerpo.condicionEspecial) ? cuerpo.condicionEspecial.join(", ") : "",
      cuerpo.tieneAbogado ? "Sí" : "No",
      "Sin asignar",
      "",
    ]);

    notificarCoordinadores(folio, cuerpo);

    return responderJson({ ok: true, folio: folio });
  } catch (error) {
    console.error(error);
    return responderJson({ ok: false });
  } finally {
    bloqueo.releaseLock();
  }
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(NOMBRE_HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
  }
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(ENCABEZADOS);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function generarFolio(hoja) {
  const yyyymmdd = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
  const consecutivo = Math.max(hoja.getLastRow(), 1);
  const sufijo = String(consecutivo).padStart(4, "0");
  return "AL-" + yyyymmdd + "-" + sufijo;
}

function notificarCoordinadores(folio, datos) {
  const destinatarios = PropertiesService.getScriptProperties().getProperty("DESTINATARIOS");
  if (!destinatarios) return;

  const urgenciaEtiqueta = { alta: "🔴 ALTA", media: "🟡 Media", baja: "🟢 Baja" }[datos.urgencia] || datos.urgencia;

  const asunto = "[" + urgenciaEtiqueta + "] Nueva solicitud " + folio + " — " + (datos.municipio || "");

  const cuerpoHtml =
    "<p><strong>Folio:</strong> " + folio + "</p>" +
    "<p><strong>Nombre:</strong> " + escaparHtml(datos.nombre) + "</p>" +
    "<p><strong>Teléfono:</strong> " + escaparHtml(datos.telefono) + "</p>" +
    "<p><strong>Ubicación:</strong> " + escaparHtml(datos.municipio) + ", " + escaparHtml(datos.departamento) + "</p>" +
    "<p><strong>Urgencia:</strong> " + urgenciaEtiqueta + "</p>" +
    "<p><strong>Descripción:</strong><br>" + escaparHtml(datos.descripcion) + "</p>" +
    "<p>Revisa el caso completo en la hoja de cálculo.</p>";

  MailApp.sendEmail({
    to: destinatarios,
    subject: asunto,
    htmlBody: cuerpoHtml,
  });
}

function escaparHtml(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function responderJson(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
