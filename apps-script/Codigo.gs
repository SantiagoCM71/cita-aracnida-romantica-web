/**
 * Aviso de "cita aceptada" para la invitación arácnida.
 *
 * Pega este archivo en https://script.google.com (Apps Script), ajusta CONFIG
 * y publícalo como aplicación web. El paso a paso está en NOTIFICACIONES.md.
 *
 * Lo importante: las credenciales (tu correo y la llave de WhatsApp) viven
 * aquí, en el servidor de Google, y nunca aparecen en el HTML público.
 */

const CONFIG = {
  // Correo donde quieres recibir el aviso.
  correoDestino: 'soporteowlcolombia@gmail.com',

  // Debe ser idéntico a tokenNotificaciones en index.html.
  token: 'cita-0808',

  // WhatsApp opcional vía CallMeBot. Déjalos vacíos si solo quieres correo.
  whatsappNumero: '',   // ej: '573001112233'
  whatsappApiKey: ''    // la que te da CallMeBot al registrar tu número
};

function doPost(e) {
  try {
    const datos = leerCuerpo(e);

    if (CONFIG.token && datos.token !== CONFIG.token) {
      return responder({ ok: false, error: 'token-invalido' });
    }

    const resumen = construirResumen(datos);
    enviarCorreo(resumen);
    const whatsapp = enviarWhatsApp(resumen);

    return responder({ ok: true, correo: true, whatsapp: whatsapp });
  } catch (error) {
    console.error(error);
    return responder({ ok: false, error: String(error) });
  }
}

function doGet() {
  return responder({ ok: true, mensaje: 'Servicio de avisos activo' });
}

function leerCuerpo(e) {
  const crudo = e && e.postData && e.postData.contents;
  if (!crudo) throw new Error('Petición sin cuerpo');
  return JSON.parse(crudo);
}

function construirResumen(datos) {
  const zona = datos.zonaHoraria || Session.getScriptTimeZone();
  const cuando = datos.aceptadaEnLocal
    || Utilities.formatDate(new Date(), zona, "d 'de' MMMM, h:mm a");

  return {
    invitada: datos.invitada || 'Ella',
    cuando: cuando,
    zona: zona,
    intentosDeNo: Number(datos.intentosDeNo || 0),
    dispositivo: datos.dispositivo || 'desconocido'
  };
}

function enviarCorreo(resumen) {
  const asunto = '🕷♥ ¡Dijo que SÍ a la cita!';
  const cuerpoHtml =
    '<div style="font-family:Trebuchet MS,Segoe UI,sans-serif;max-width:520px">' +
    '<h2 style="color:#df173e;margin:0 0 12px">¡Cita confirmada!</h2>' +
    '<p style="margin:0 0 16px">' + escapar(resumen.invitada) + ' acaba de aceptar la invitación.</p>' +
    '<table style="border-collapse:collapse;font-size:14px">' +
    fila('Aceptada el', resumen.cuando) +
    fila('Zona horaria', resumen.zona) +
    fila('Veces que intentó el “No”', String(resumen.intentosDeNo)) +
    fila('Dispositivo', resumen.dispositivo) +
    '</table>' +
    '<p style="margin:18px 0 0">Plan: 7:00 p. m. · alitas 🍗 y El Hombre Araña 🎬</p>' +
    '</div>';

  MailApp.sendEmail({
    to: CONFIG.correoDestino,
    subject: asunto,
    htmlBody: cuerpoHtml,
    body: resumen.invitada + ' aceptó la cita el ' + resumen.cuando + '.'
  });
}

function enviarWhatsApp(resumen) {
  if (!CONFIG.whatsappNumero || !CONFIG.whatsappApiKey) return false;

  const texto = '🕷♥ ¡' + resumen.invitada + ' aceptó la cita! (' + resumen.cuando + ') '
    + 'Hoy 7:00 p. m.: alitas y El Hombre Araña.';
  const url = 'https://api.callmebot.com/whatsapp.php'
    + '?phone=' + encodeURIComponent(CONFIG.whatsappNumero)
    + '&text=' + encodeURIComponent(texto)
    + '&apikey=' + encodeURIComponent(CONFIG.whatsappApiKey);

  try {
    UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    return true;
  } catch (error) {
    // Si CallMeBot falla, el correo ya salió: no tumbamos la respuesta.
    console.error(error);
    return false;
  }
}

function fila(etiqueta, valor) {
  return '<tr>'
    + '<td style="padding:4px 12px 4px 0;color:#666">' + escapar(etiqueta) + '</td>'
    + '<td style="padding:4px 0"><b>' + escapar(valor) + '</b></td>'
    + '</tr>';
}

function escapar(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Ejecuta esta función a mano en el editor para probar que llega el correo. */
function pruebaDeEnvio() {
  enviarCorreo(construirResumen({
    invitada: 'Prueba',
    intentosDeNo: 3,
    dispositivo: 'Editor de Apps Script'
  }));
}
