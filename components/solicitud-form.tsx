"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import {
  solicitudSchema,
  TIPOS_AYUDA_LIST,
  TIPOS_AYUDA_LABELS,
  CONDICIONES_ESPECIALES_LIST,
  CONDICIONES_ESPECIALES_LABELS,
} from "@/lib/schema";
import { DEPARTAMENTOS } from "@/lib/departamentos";
import { Field, FieldGroup } from "@/components/field";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckboxCard, CheckboxRow } from "@/components/ui/checkbox";
import { RadioCard } from "@/components/ui/radio";

const CLAVE_BORRADOR = "asistencia-legal:borrador";

const TITULOS_PASO = ["Contacto", "Ubicación", "Tu caso"] as const;

type CampoNombre =
  | "nombre"
  | "telefono"
  | "email"
  | "canalPreferido"
  | "departamento"
  | "municipio"
  | "barrioVereda"
  | "tipoAyuda"
  | "descripcion"
  | "urgencia"
  | "personasAfectadas"
  | "condicionEspecial"
  | "tieneAbogado"
  | "aceptaTratamientoDatos"
  | "confirmaVeracidad";

const CAMPOS_POR_PASO: CampoNombre[][] = [
  ["nombre", "telefono", "email", "canalPreferido"],
  ["departamento", "municipio", "barrioVereda"],
  [
    "tipoAyuda",
    "descripcion",
    "urgencia",
    "personasAfectadas",
    "condicionEspecial",
    "tieneAbogado",
    "aceptaTratamientoDatos",
    "confirmaVeracidad",
  ],
];

const defaultValues = {
  nombre: "",
  telefono: "",
  email: "",
  canalPreferido: "" as "" | "whatsapp" | "llamada" | "email",
  departamento: "" as "" | (typeof DEPARTAMENTOS)[number],
  municipio: "",
  barrioVereda: "",
  tipoAyuda: [] as string[],
  descripcion: "",
  urgencia: "" as "" | "alta" | "media" | "baja",
  personasAfectadas: 1,
  condicionEspecial: [] as string[],
  tieneAbogado: false,
  aceptaTratamientoDatos: false,
  confirmaVeracidad: false,
  sitioWeb: "",
  _t: 0,
};

type FormValues = typeof defaultValues;

// Campos que nunca se guardan en el navegador, aunque el usuario cierre la
// pestaña a medias: el consentimiento debe darse cada vez, no recordarse.
const CAMPOS_EXCLUIDOS_DEL_BORRADOR = new Set<CampoNombre>([
  "aceptaTratamientoDatos",
  "confirmaVeracidad",
]);

function cargarBorrador(): Partial<FormValues> | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = window.localStorage.getItem(CLAVE_BORRADOR);
    if (!crudo) return null;
    return JSON.parse(crudo) as Partial<FormValues>;
  } catch {
    return null;
  }
}

function guardarBorrador(valores: FormValues) {
  try {
    const paraGuardar = { ...valores };
    for (const campo of CAMPOS_EXCLUIDOS_DEL_BORRADOR) {
      delete (paraGuardar as Record<string, unknown>)[campo];
    }
    delete (paraGuardar as Record<string, unknown>).sitioWeb;
    delete (paraGuardar as Record<string, unknown>)._t;
    window.localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(paraGuardar));
  } catch {
    // localStorage puede fallar en modo privado; no es crítico.
  }
}

function limpiarBorrador() {
  try {
    window.localStorage.removeItem(CLAVE_BORRADOR);
  } catch {
    // no-op
  }
}

function primerMensajeError(errores: unknown[]): string | undefined {
  const primero = errores[0];
  if (!primero) return undefined;
  if (typeof primero === "string") return primero;
  if (typeof primero === "object" && primero !== null && "message" in primero) {
    return String((primero as { message: unknown }).message);
  }
  return undefined;
}

/** Valida un único campo contra el schema compartido; usado en onChange, onBlur y onSubmit. */
function validador<K extends keyof typeof solicitudSchema.shape>(campo: K) {
  return ({ value }: { value: unknown }) => {
    const resultado = solicitudSchema.shape[campo].safeParse(value);
    if (resultado.success) return undefined;
    return primerMensajeError(resultado.error.issues);
  };
}

export function SolicitudForm() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [avanzando, setAvanzando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const borradorCargado = useRef(false);

  const form = useForm({
    defaultValues,
    listeners: {
      onChange: ({ formApi }) => guardarBorrador(formApi.state.values),
      onChangeDebounceMs: 400,
    },
    onSubmit: async ({ value }) => {
      setErrorEnvio(null);
      const resultado = solicitudSchema.safeParse(value);
      if (!resultado.success) {
        setErrorEnvio("Revisa los campos marcados antes de enviar.");
        return;
      }

      try {
        const respuesta = await fetch("/api/solicitudes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resultado.data),
        });

        const cuerpo = (await respuesta.json()) as { ok: boolean; folio?: string; error?: string };

        if (!respuesta.ok || !cuerpo.ok || !cuerpo.folio) {
          setErrorEnvio(
            cuerpo.error ??
              "No pudimos enviar tu solicitud. Revisa tu conexión e intenta de nuevo — tus datos siguen aquí.",
          );
          return;
        }

        limpiarBorrador();
        router.push(`/gracias?folio=${encodeURIComponent(cuerpo.folio)}`);
      } catch {
        setErrorEnvio(
          "No pudimos enviar tu solicitud. Revisa tu conexión e intenta de nuevo — tus datos siguen aquí.",
        );
      }
    },
  });

  // Cargar borrador y fijar la marca de tiempo antiabuso solo en el cliente.
  useEffect(() => {
    if (borradorCargado.current) return;
    borradorCargado.current = true;

    form.setFieldValue("_t", Date.now());

    const borrador = cargarBorrador();
    if (!borrador) return;
    for (const [clave, valor] of Object.entries(borrador)) {
      if (valor === undefined) continue;
      form.setFieldValue(clave as keyof FormValues, valor as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function irAlSiguientePaso() {
    const campos = CAMPOS_POR_PASO[paso];
    setAvanzando(true);
    try {
      const resultados = await Promise.all(
        campos.map((campo) => form.validateField(campo, "change")),
      );
      const hayErrores = resultados.some((errores) => Array.isArray(errores) && errores.length > 0);
      if (hayErrores) {
        contenedorRef.current
          ?.querySelector('[aria-invalid="true"]')
          ?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      setPaso((p) => Math.min(p + 1, CAMPOS_POR_PASO.length - 1));
      contenedorRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    } finally {
      setAvanzando(false);
    }
  }

  function irAlPasoAnterior() {
    setPaso((p) => Math.max(p - 1, 0));
    contenedorRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  const esUltimoPaso = paso === CAMPOS_POR_PASO.length - 1;

  return (
    <div ref={contenedorRef} className="mx-auto w-full max-w-md px-4 pb-28 pt-6 sm:pb-8">
      <ol className="mb-6 flex items-center gap-2" aria-label="Progreso del formulario">
        {TITULOS_PASO.map((titulo, indice) => (
          <li key={titulo} className="flex flex-1 flex-col gap-1.5">
            <div
              className={`h-1.5 rounded-full ${indice <= paso ? "bg-emerald-700" : "bg-neutral-200"}`}
              aria-hidden="true"
            />
            <span className={`text-xs ${indice === paso ? "font-semibold text-emerald-800" : "text-neutral-500"}`}>
              {indice + 1}. {titulo}
            </span>
          </li>
        ))}
      </ol>
      <p className="sr-only" role="status">
        Paso {paso + 1} de {TITULOS_PASO.length}: {TITULOS_PASO[paso]}
      </p>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (esUltimoPaso) {
            void form.handleSubmit();
          } else {
            void irAlSiguientePaso();
          }
        }}
        className="flex flex-col gap-5"
      >
        {/* Honeypot: oculto visualmente pero presente en el DOM y accesible al foco de teclado
            para que un bot que solo revisa CSS básico no lo detecte como trampa. */}
        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="sitioWeb">Sitio web</label>
          <form.Field name="sitioWeb">
            {(field) => (
              <input
                id="sitioWeb"
                name="sitioWeb"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
        </div>

        <section hidden={paso !== 0} className="flex flex-col gap-5">
          <form.Field name="nombre" validators={{ onChange: validador("nombre"), onBlur: validador("nombre") }}>
            {(field) => (
              <Field id="nombre" label="Nombre completo" required error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}>
                <Input
                  id="nombre"
                  name="nombre"
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="telefono" validators={{ onChange: validador("telefono"), onBlur: validador("telefono") }}>
            {(field) => (
              <Field
                id="telefono"
                label="Celular"
                hint="Con este número te contactaremos por WhatsApp o llamada"
                required
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  enterKeyHint="next"
                  placeholder="3001234567"
                  aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="email" validators={{ onChange: validador("email"), onBlur: validador("email") }}>
            {(field) => (
              <Field
                id="email"
                label="Correo (opcional)"
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="off"
                  enterKeyHint="next"
                  aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="canalPreferido" validators={{ onChange: validador("canalPreferido") }}>
            {(field) => (
              <FieldGroup
                legend="¿Cómo prefieres que te contactemos?"
                required
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                {[
                  { valor: "whatsapp", etiqueta: "WhatsApp" },
                  { valor: "llamada", etiqueta: "Llamada" },
                  { valor: "email", etiqueta: "Correo" },
                ].map((opcion) => (
                  <RadioCard
                    key={opcion.valor}
                    id={`canalPreferido-${opcion.valor}`}
                    name="canalPreferido"
                    label={opcion.etiqueta}
                    checked={field.state.value === opcion.valor}
                    onChange={() => field.handleChange(opcion.valor as typeof field.state.value)}
                    onBlur={field.handleBlur}
                  />
                ))}
              </FieldGroup>
            )}
          </form.Field>
        </section>

        <section hidden={paso !== 1} className="flex flex-col gap-5">
          <form.Field name="departamento" validators={{ onChange: validador("departamento") }}>
            {(field) => (
              <Field
                id="departamento"
                label="Departamento"
                required
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                <Select
                  id="departamento"
                  name="departamento"
                  aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as typeof field.state.value)}
                >
                  <option value="">Selecciona…</option>
                  {DEPARTAMENTOS.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </form.Field>

          <form.Field name="municipio" validators={{ onChange: validador("municipio"), onBlur: validador("municipio") }}>
            {(field) => (
              <Field
                id="municipio"
                label="Municipio o ciudad"
                required
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                <Input
                  id="municipio"
                  name="municipio"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="barrioVereda" validators={{ onChange: validador("barrioVereda") }}>
            {(field) => (
              <Field
                id="barrioVereda"
                label="Barrio o vereda (opcional)"
                hint="No necesitamos tu dirección exacta"
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                <Input
                  id="barrioVereda"
                  name="barrioVereda"
                  autoCapitalize="words"
                  enterKeyHint="done"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>
        </section>

        <section hidden={paso !== 2} className="flex flex-col gap-5">
          <form.Field name="tipoAyuda" validators={{ onChange: validador("tipoAyuda") }}>
            {(field) => (
              <FieldGroup
                legend="¿Con qué necesitas ayuda?"
                hint="Puedes marcar varias opciones"
                required
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                {TIPOS_AYUDA_LIST.map((tipo) => (
                  <CheckboxCard
                    key={tipo}
                    id={`tipoAyuda-${tipo}`}
                    name="tipoAyuda"
                    label={TIPOS_AYUDA_LABELS[tipo]}
                    checked={field.state.value.includes(tipo)}
                    onBlur={field.handleBlur}
                    onChange={() =>
                      field.handleChange(
                        field.state.value.includes(tipo)
                          ? field.state.value.filter((v) => v !== tipo)
                          : [...field.state.value, tipo],
                      )
                    }
                  />
                ))}
              </FieldGroup>
            )}
          </form.Field>

          <form.Field name="descripcion" validators={{ onChange: validador("descripcion"), onBlur: validador("descripcion") }}>
            {(field) => (
              <Field
                id="descripcion"
                label="Cuéntanos qué pasó"
                hint={`${field.state.value.length}/1500`}
                required
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  maxLength={1500}
                  enterKeyHint="done"
                  aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="urgencia" validators={{ onChange: validador("urgencia") }}>
            {(field) => (
              <FieldGroup
                legend="Urgencia"
                required
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                {[
                  { valor: "alta", etiqueta: "Alta — riesgo inmediato" },
                  { valor: "media", etiqueta: "Media" },
                  { valor: "baja", etiqueta: "Baja" },
                ].map((opcion) => (
                  <RadioCard
                    key={opcion.valor}
                    id={`urgencia-${opcion.valor}`}
                    name="urgencia"
                    label={opcion.etiqueta}
                    checked={field.state.value === opcion.valor}
                    onChange={() => field.handleChange(opcion.valor as typeof field.state.value)}
                    onBlur={field.handleBlur}
                  />
                ))}
              </FieldGroup>
            )}
          </form.Field>

          <form.Field
            name="personasAfectadas"
            validators={{ onChange: validador("personasAfectadas"), onBlur: validador("personasAfectadas") }}
          >
            {(field) => (
              <Field
                id="personasAfectadas"
                label="Personas afectadas"
                required
                error={field.state.meta.isTouched ? primerMensajeError(field.state.meta.errors) : undefined}
              >
                <Input
                  id="personasAfectadas"
                  name="personasAfectadas"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={50}
                  enterKeyHint="next"
                  aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="condicionEspecial">
            {(field) => (
              <FieldGroup legend="Condiciones especiales (opcional)">
                {CONDICIONES_ESPECIALES_LIST.map((cond) => (
                  <CheckboxCard
                    key={cond}
                    id={`condicionEspecial-${cond}`}
                    name="condicionEspecial"
                    label={CONDICIONES_ESPECIALES_LABELS[cond]}
                    checked={field.state.value.includes(cond)}
                    onChange={() =>
                      field.handleChange(
                        field.state.value.includes(cond)
                          ? field.state.value.filter((v) => v !== cond)
                          : [...field.state.value, cond],
                      )
                    }
                  />
                ))}
              </FieldGroup>
            )}
          </form.Field>

          <form.Field name="tieneAbogado">
            {(field) => (
              <CheckboxRow
                id="tieneAbogado"
                name="tieneAbogado"
                label="Ya tengo un abogado ayudándome con este caso"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
            )}
          </form.Field>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <form.Field
              name="aceptaTratamientoDatos"
              validators={{ onChange: validador("aceptaTratamientoDatos") }}
            >
              {(field) => (
                <div>
                  <CheckboxRow
                    id="aceptaTratamientoDatos"
                    name="aceptaTratamientoDatos"
                    label={
                      <>
                        Autorizo el tratamiento de mis datos personales según la{" "}
                        <a href="/privacidad" target="_blank" className="underline">
                          política de privacidad
                        </a>
                        . *
                      </>
                    }
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-sm font-medium text-red-600">
                      {primerMensajeError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="confirmaVeracidad" validators={{ onChange: validador("confirmaVeracidad") }}>
              {(field) => (
                <div>
                  <CheckboxRow
                    id="confirmaVeracidad"
                    name="confirmaVeracidad"
                    label="Confirmo que la información que di es verídica. *"
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p role="alert" className="mt-1 text-sm font-medium text-red-600">
                      {primerMensajeError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {errorEnvio && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
              {errorEnvio}
            </p>
          )}
        </section>

        <div
          className="fixed inset-x-0 bottom-0 flex gap-3 border-t border-neutral-200 bg-white p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
        >
          {paso > 0 && (
            <Button type="button" variante="secundario" onClick={irAlPasoAnterior} className="flex-1 sm:flex-none">
              Atrás
            </Button>
          )}
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={avanzando || isSubmitting} className="flex-1 sm:flex-none">
                {esUltimoPaso ? (isSubmitting ? "Enviando…" : "Enviar solicitud") : "Siguiente"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
