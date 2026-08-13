# Configurar el backend en Google Apps Script

Esta es la parte del proyecto que **no se despliega con `git push`** — vive en la cuenta
de Google del equipo coordinador y hay que configurarla a mano una sola vez. Sigue estos
pasos en orden.

## 1. Crear la hoja de cálculo

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva.
2. Nómbrala, por ejemplo, `Solicitudes — Asistencia Legal Terremoto`.
3. No necesitas crear encabezados manualmente: el script los crea solo la primera vez
   que recibe una solicitud, en una pestaña llamada `Solicitudes`.

## 2. Abrir el editor de Apps Script

1. En la hoja, ve a **Extensiones → Apps Script**.
2. Borra el contenido de `Código.gs` que aparece por defecto.
3. Copia y pega el contenido de [`Codigo.gs`](./Codigo.gs) de este repositorio.
4. Guarda el proyecto (ícono de disquete o `Cmd/Ctrl + S`). Ponle un nombre, por ejemplo
   `asistencia-legal-backend`.

## 3. Configurar las propiedades del script (los secretos)

El código **no** contiene ningún secreto — se configuran aparte para que nunca terminen
en GitHub.

1. En el editor de Apps Script, ve a **Configuración del proyecto** (ícono de engranaje
   en la barra lateral).
2. Baja hasta **Propiedades del script** y agrega:

   | Propiedad | Valor |
   |---|---|
   | `SHARED_TOKEN` | Un valor secreto largo y aleatorio. Genéralo con `openssl rand -hex 32` en tu terminal. |
   | `DESTINATARIOS` | Los correos del equipo coordinador que deben recibir la notificación, separados por coma. |

   Este mismo valor de `SHARED_TOKEN` es el que pondrás luego en la variable de entorno
   `APPS_SCRIPT_TOKEN` de la app en Vercel — deben coincidir exactamente.

## 4. Desplegar como aplicación web

1. En el editor, ve a **Implementar → Nueva implementación**.
2. En "Selecciona el tipo", elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo (tu cuenta de Google).
   - **Quién tiene acceso:** Cualquier usuario.
4. Haz clic en **Implementar**.
5. La primera vez, Google pedirá autorizar permisos (acceso a la hoja y a enviar
   correos con `MailApp`). Revisa y acepta — es tu propio script pidiendo actuar en tu
   nombre.
6. Copia la **URL de la aplicación web** que te da (termina en `/exec`). Esa es tu
   `APPS_SCRIPT_URL`.

## 5. Probar con curl

Reemplaza `TU_URL` y `TU_TOKEN` con los valores reales:

```bash
curl -X POST "TU_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TU_TOKEN",
    "nombre": "Prueba",
    "telefono": "3001234567",
    "canalPreferido": "whatsapp",
    "departamento": "Cundinamarca",
    "municipio": "Bogotá D.C.",
    "tipoAyuda": ["vivienda_danada"],
    "descripcion": "Esto es una prueba de conexión con Apps Script.",
    "urgencia": "baja",
    "personasAfectadas": 1,
    "condicionEspecial": [],
    "tieneAbogado": false
  }'
```

Deberías ver `{"ok":true,"folio":"AL-..."}`, una fila nueva en la hoja y un correo en
`DESTINATARIOS`. Si envías sin `token` o con uno incorrecto, la respuesta es
`{"ok":false}` y no se crea ninguna fila.

## 6. Conectar con la app

En Vercel (o en tu `.env.local` para desarrollo), configura:

```
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
APPS_SCRIPT_TOKEN=el-mismo-valor-que-pusiste-en-SHARED_TOKEN
```

## Errores comunes

- **"Autorización requerida" o la implementación no responde**: vuelve a los pasos de
  autorización del punto 4.5 — algunos permisos requieren volver a aceptarlos tras
  cambios en el código.
- **Los cambios al código no se reflejan**: cada edición requiere una **nueva
  implementación** (Implementar → Gestionar implementaciones → editar → Nueva versión),
  no basta con guardar el archivo.
- **No llegan los correos**: revisa la cuota diaria de `MailApp` (~100 correos/día con
  una cuenta Gmail gratuita, más con Google Workspace) y que `DESTINATARIOS` esté bien
  escrito, sin espacios extra entre correos.
- **`{"ok":false}` en todas las solicitudes**: el `token` enviado no coincide con
  `SHARED_TOKEN`. Revisa que no haya espacios ni saltos de línea accidentales al
  copiarlo.
