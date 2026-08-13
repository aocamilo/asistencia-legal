# Cómo aportar

Gracias por considerar contribuir a este proyecto. Es un esfuerzo comunitario para
ayudar a personas afectadas por el terremoto en Colombia a conseguir asesoría jurídica
gratuita — cada mejora, por pequeña que sea, ayuda directamente a que más casos se
atiendan a tiempo.

## Antes de empezar

Revisa [README.md](./README.md) para levantar el proyecto localmente. No necesitas
credenciales de Google para contribuir: la app corre en modo *dry-run* sin ellas.

## Buenas primeras tareas

Busca el filtro [`good-first-issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue)
en los issues. Si no hay ninguno abierto que te llame la atención, aquí hay ideas
concretas para arrancar:

- Mejorar textos y microcopy del formulario (claridad, tono, errores más útiles).
- Ampliar el catálogo de municipios por departamento (hoy solo se pide el nombre en
  texto libre).
- Modo oscuro.
- Pruebas de accesibilidad con lector de pantalla real (VoiceOver, TalkBack) y arreglos
  derivados.
- Traducción del formulario a lenguas indígenas u otros idiomas relevantes para las
  zonas afectadas.

Si tienes una idea que no está aquí, abre un issue primero para discutirla antes de
invertir tiempo en el código — así evitamos trabajo duplicado o PRs que no encajan con
la dirección del proyecto.

## Flujo de trabajo

1. Haz fork del repositorio.
2. Crea una rama descriptiva: `feat/nombre-de-la-mejora` o `fix/nombre-del-bug`.
3. Commits en formato [Conventional Commits](https://www.conventionalcommits.org/es/)
   (`feat:`, `fix:`, `docs:`, `refactor:`, etc.).
4. Abre un Pull Request contra `main` y completa la plantilla.

## Requisitos para que un PR se revise

- `pnpm lint`, `pnpm typecheck` y `pnpm build` deben pasar en verde. El workflow de CI
  los corre automáticamente, pero verifícalo localmente antes de abrir el PR.
- Si tu cambio toca la interfaz, incluye una captura o video **desde una vista móvil
  (~360–390px de ancho)** — el celular es el caso de uso principal de este proyecto, no
  una idea secundaria.
- Describe qué probaste manualmente, no solo qué cambiaste.

## Convenciones de código

- TypeScript estricto, sin `any`.
- Server Components por defecto; usa `"use client"` solo en los archivos que
  realmente necesitan interactividad (hoy, básicamente `components/solicitud-form.tsx`).
- Tailwind mobile-first: las clases sin prefijo son la versión móvil; `sm:`/`md:`/`lg:`
  amplían para pantallas más grandes, nunca al revés.
- `lib/schema.ts` es la única fuente de verdad sobre la forma de los datos del
  formulario. Un campo nuevo se agrega ahí primero, y se valida tanto en el cliente
  (`components/solicitud-form.tsx`) como en el servidor (`app/api/solicitudes/route.ts`)
  reutilizando ese mismo schema.

## Reglas no negociables

Estas reglas existen porque el formulario maneja datos de personas en una situación
vulnerable. Un PR que las rompa no se va a aceptar, sin importar qué tan bueno sea el
resto del cambio.

1. **Nunca commitear `.env.local` ni ningún secreto.** El repo es público; cualquier
   token filtrado hay que rotarlo de inmediato.
2. **Nunca agregar campos que pidan cédula, dirección exacta o datos bancarios.** El
   formulario recoge lo mínimo necesario para que un abogado haga contacto — cualquier
   dato adicional sensible se pide después, por teléfono, ya con la persona identificada.
3. **Nunca loguear información personal** (nombre, teléfono, correo, descripción del
   caso) en el servidor ni en el cliente. Los `console.error` deben describir el
   problema sin incluir los datos de la solicitud.
4. **Nunca agregar scripts de terceros** (analítica, chat en vivo, mapas, fuentes
   externas) sin discutirlo primero en un issue. Cada dominio externo es una fuga
   potencial de datos de personas afectadas y además pesa en conexiones móviles lentas.
5. **Todo campo nuevo pasa por `lib/schema.ts`** y se valida también en el servidor —
   la validación del cliente nunca es suficiente por sí sola.

## Cómo reportar una vulnerabilidad de seguridad

No abras un issue público. Escribe directamente al correo de contacto del equipo
coordinador (lo encuentras en la página `/privacidad` del sitio desplegado) describiendo
el problema. Te responderemos y coordinaremos la corrección antes de hacerla pública.

## Dudas

Si algo de este documento o del código no queda claro, abre un issue con la etiqueta
`question` — si tú tienes la duda, probablemente alguien más también la tenga.
