# Cómo recibir el aviso cuando ella acepte

La invitación es una página estática (solo `index.html`), así que por sí sola no
puede mandar correos ni WhatsApp: necesita alguien que lo haga por ella. Ese
"alguien" es un pequeño script gratuito en tu cuenta de Google.

Hay **tres piezas**, y puedes activar solo las que quieras:

1. **Correo a tu Gmail** — recomendado, gratis, sin terceros.
2. **WhatsApp a tu número** — opcional, vía CallMeBot.
3. **Botón "Avísale por WhatsApp"** — respaldo manual, funciona sin configurar nada más.

---

## 1. Correo a tu Gmail (10 minutos)

1. Entra a <https://script.google.com> con tu cuenta de Google y crea un
   **Proyecto nuevo**.
2. Borra el contenido de `Código.gs` y pega todo el archivo
   [`apps-script/Codigo.gs`](apps-script/Codigo.gs) de este repositorio.
3. Arriba del archivo, ajusta `CONFIG`:
   - `correoDestino`: el correo donde quieres el aviso.
   - `token`: una palabra secreta cualquiera (por defecto `cita-0808`).
4. Guarda y, en el selector de funciones, elige `pruebaDeEnvio` y dale
   **Ejecutar**. Google te pedirá permisos la primera vez: acéptalos
   (aparecerá "Google no ha verificado esta aplicación" → *Configuración
   avanzada* → *Ir a (nombre del proyecto)*). Revisa que te llegue el correo de
   prueba.
5. Botón **Implementar → Nueva implementación → Aplicación web**:
   - *Ejecutar como*: **Yo**
   - *Quién tiene acceso*: **Cualquier persona**
6. Copia la **URL del Web App** (termina en `/exec`).
7. Abre `index.html`, busca el bloque `window.INVITACION_CONFIG` (está justo
   antes del script principal) y pega la URL:

```js
endpointNotificaciones: 'https://script.google.com/macros/s/AKfy.../exec',
tokenNotificaciones: 'cita-0808',
```

Listo. Cuando ella toque **"Sí, acepto ♥"**, te llega el correo con la hora
exacta y hasta cuántas veces intentó darle al botón "No".

> **Importante:** cada vez que edites el script en Google debes hacer
> *Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva*.
> Si no, sigue corriendo la versión vieja.

---

## 2. WhatsApp a tu número (opcional, 5 minutos)

Se usa [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/),
que es gratis para avisos personales:

1. Agrega el número **+34 621 331 709** a tus contactos.
2. Envíale por WhatsApp el mensaje: `I allow callmebot to send me messages`
3. Te responde con tu **APIKEY**.
4. En el Apps Script, completa:

```js
whatsappNumero: '573001112233',   // tu número con indicativo, sin + ni espacios
whatsappApiKey: '123456'          // la que te dio CallMeBot
```

5. Vuelve a implementar (nueva versión).

La llave queda **solo dentro del Apps Script**, nunca en el HTML público. Eso
importa: si la pusieras en `index.html`, cualquiera que viera el código fuente
podría mandarte mensajes.

---

## 3. Botón de respaldo por WhatsApp (1 minuto)

Este no necesita servidor. En `index.html`:

```js
whatsappRespaldo: '573001112233',   // tu número con indicativo
```

Con eso, en la pantalla de "¡Cita confirmada!" aparece un botón
**"Avísale por WhatsApp ♥"**: ella lo toca y se abre WhatsApp con el mensaje ya
escrito, listo para enviarte. Funciona aunque el Apps Script falle o no lo hayas
configurado.

---

## Qué pasa si algo falla

- Si no hay internet o Google no responde, el aviso queda guardado en el
  navegador de ella y **se reintenta solo** la próxima vez que abra la página.
- Si aun así no se logra, la pantalla muestra *"No pude avisarle sola: usa el
  botón de WhatsApp"* y aparece el botón de respaldo.
- El aviso se manda **una sola vez**: si vuelve a abrir la invitación, no te
  llega duplicado.

## Qué información se envía

Solo esto: la fecha y hora de la aceptación, la zona horaria, cuántas veces
intentó tocar el botón "No" y el identificador del navegador. Nada más.

## Probar en local

Ábrelo con un servidor simple (los `fetch` no funcionan bien con `file://`):

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```
