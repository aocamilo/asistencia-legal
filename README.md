# Asistencia Legal — Terremoto Colombia

Formulario web para que personas afectadas por el terremoto en Colombia soliciten
asesoría jurídica gratuita. Un grupo de profesionales del derecho ofrece su tiempo como
voluntariado; este proyecto existe para que esas solicitudes no se pierdan en mensajes
sueltos de WhatsApp o correo.

Cada solicitud queda registrada en una hoja de Google Sheets y dispara un correo
automático al equipo coordinador. El código es **open source** — cualquier
desarrollador puede aportar, ver [CONTRIBUTING.md](./CONTRIBUTING.md).

**Diseñado mobile-first**: la mayoría de personas afectadas solo tiene un celular para
pedir ayuda, así que esa es la experiencia principal, no una adaptación posterior.

## Cómo correrlo localmente

```bash
git clone <url-de-este-repositorio>
cd asistencia-legal
pnpm install
cp .env.example .env.local
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

**No necesitas credenciales de Google para contribuir.** Sin `APPS_SCRIPT_URL`
configurada en `.env.local`, la app corre en modo *dry-run*: el formulario valida y
responde con normalidad, y cada solicitud se imprime en la consola del servidor en vez
de guardarse en una hoja real. Esto es suficiente para trabajar en UI, accesibilidad,
textos o el flujo del formulario.

Si necesitas probar la integración completa con Google Sheets, sigue
[`apps-script/README.md`](./apps-script/README.md).

## Arquitectura

```
Navegador                Vercel (Next.js)              Google
─────────                ────────────────              ──────
formulario  ──POST──▶  /api/solicitudes            Apps Script Web App
(TanStack               · valida con Zod (server)  ──▶  · valida token
 Form + Zod)            · honeypot + timing              · appendRow → Sheet
                        · rate limit por IP               · MailApp → coordinadores
                        · agrega el token secreto   ◀──  └─▶ { ok, folio }
                        └─ APPS_SCRIPT_URL (env)
```

La URL del Apps Script y el token nunca llegan al navegador: viven solo en el servidor
(Route Handler de Next.js), por eso el formulario no llama a Google directamente.

| Dónde vive qué | Ruta |
|---|---|
| Formulario (cliente) | `components/solicitud-form.tsx` |
| Validación compartida (cliente y servidor) | `lib/schema.ts` |
| Endpoint que recibe el formulario | `app/api/solicitudes/route.ts` |
| Antispam (rate limit) | `lib/rate-limit.ts` |
| Cliente hacia Apps Script (con modo dry-run) | `lib/apps-script.ts` |
| Script de Google (Sheets + correo) | `apps-script/Codigo.gs` |

## Variables de entorno

| Variable | Obligatoria | Para qué sirve | Cómo obtenerla |
|---|---|---|---|
| `APPS_SCRIPT_URL` | No (dry-run sin ella) | URL de la implementación del Apps Script | [`apps-script/README.md`](./apps-script/README.md) |
| `APPS_SCRIPT_TOKEN` | No (dry-run sin ella) | Token compartido para autenticar contra el Apps Script | `openssl rand -hex 32`, y debe coincidir con `SHARED_TOKEN` en las Propiedades del script |

**Importante:** ninguna variable debe llevar el prefijo `NEXT_PUBLIC_` — eso las
expondría en el JavaScript que se envía al navegador. Ambas son solo de servidor.

## Stack técnico

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com), mobile-first
- [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev) para validación de cliente y servidor con el mismo schema
- [Google Apps Script](https://developers.google.com/apps-script) como backend gratuito (Sheets + `MailApp`)
- [Vercel](https://vercel.com) para el despliegue

## Scripts

```bash
pnpm dev         # servidor de desarrollo
pnpm build       # build de producción
pnpm lint        # ESLint
pnpm typecheck   # TypeScript sin emitir archivos
```

## Desplegar en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. En **Project Settings → Environment Variables**, agrega `APPS_SCRIPT_URL` y
   `APPS_SCRIPT_TOKEN` (Production y Preview) — primero necesitas haber desplegado el
   Apps Script siguiendo [`apps-script/README.md`](./apps-script/README.md).
3. Despliega. Sin esas variables, el sitio funciona pero no guarda nada (modo dry-run
   también aplica en producción, así que no lo dejes así por accidente).

## Cómo aportar

Este proyecto se mantiene con ayuda de la comunidad. Lee
[CONTRIBUTING.md](./CONTRIBUTING.md) para el flujo de trabajo, convenciones de código y
las reglas no negociables sobre datos sensibles. Hay tareas etiquetadas
`good-first-issue` para quien quiera empezar.

## Licencia

[MIT](./LICENSE)
