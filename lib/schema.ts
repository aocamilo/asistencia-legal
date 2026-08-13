import { z } from "zod";
import { DEPARTAMENTOS } from "./departamentos";

const TIPOS_AYUDA = [
  "vivienda_danada",
  "arriendo_desalojo",
  "documentos_perdidos",
  "seguros_indemnizacion",
  "ayudas_estatales",
  "laboral",
  "familia_custodia",
  "fallecimiento_sucesion",
  "otro",
] as const;

const CONDICIONES_ESPECIALES = [
  "adulto_mayor",
  "menores_a_cargo",
  "discapacidad",
  "gestante",
] as const;

export type TipoAyuda = (typeof TIPOS_AYUDA)[number];
export type CondicionEspecial = (typeof CONDICIONES_ESPECIALES)[number];

export const TIPOS_AYUDA_LABELS: Record<TipoAyuda, string> = {
  vivienda_danada: "Vivienda dañada o destruida",
  arriendo_desalojo: "Arriendo o riesgo de desalojo",
  documentos_perdidos: "Documentos perdidos",
  seguros_indemnizacion: "Seguros e indemnizaciones",
  ayudas_estatales: "Ayudas estatales y subsidios",
  laboral: "Asuntos laborales",
  familia_custodia: "Familia o custodia",
  fallecimiento_sucesion: "Fallecimiento o sucesión",
  otro: "Otro",
};

export const CONDICIONES_ESPECIALES_LABELS: Record<CondicionEspecial, string> = {
  adulto_mayor: "Adulto mayor",
  menores_a_cargo: "Menores a cargo",
  discapacidad: "Discapacidad",
  gestante: "Mujer gestante o lactante",
};

/** Acepta 3001234567, +57 300 123 4567, 300-123-4567, etc. y lo normaliza a 10 dígitos. */
function normalizarTelefono(valor: string): string {
  const soloDigitos = valor.replace(/[\s().-]/g, "").replace(/^\+?57/, "");
  return soloDigitos;
}

export const solicitudSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre completo")
    .max(80, "Máximo 80 caracteres"),

  telefono: z
    .string()
    .trim()
    .transform(normalizarTelefono)
    .pipe(
      z
        .string()
        .regex(/^3\d{9}$/, "Escribe un celular colombiano válido, por ejemplo 3001234567"),
    ),

  email: z
    .union([z.literal(""), z.string().trim().email("Correo inválido")])
    .optional(),

  canalPreferido: z.enum(["whatsapp", "llamada", "email"], {
    message: "Selecciona un canal de contacto",
  }),

  departamento: z.enum(DEPARTAMENTOS, {
    message: "Selecciona tu departamento",
  }),

  municipio: z
    .string()
    .trim()
    .min(2, "Escribe tu municipio")
    .max(60, "Máximo 60 caracteres"),

  barrioVereda: z.string().trim().max(60, "Máximo 60 caracteres").optional(),

  tipoAyuda: z
    .array(z.enum(TIPOS_AYUDA))
    .min(1, "Selecciona al menos un tipo de ayuda"),

  descripcion: z
    .string()
    .trim()
    .min(20, "Cuéntanos un poco más, al menos 20 caracteres")
    .max(1500, "Máximo 1500 caracteres"),

  urgencia: z.enum(["alta", "media", "baja"], {
    message: "Selecciona el nivel de urgencia",
  }),

  personasAfectadas: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe ser al menos 1")
    .max(50, "Si son más de 50 personas, contáctanos directamente"),

  condicionEspecial: z.array(z.enum(CONDICIONES_ESPECIALES)).default([]),

  tieneAbogado: z.boolean().default(false),

  aceptaTratamientoDatos: z.literal(true, {
    message: "Debes aceptar el tratamiento de datos para continuar",
  }),

  confirmaVeracidad: z.literal(true, {
    message: "Debes confirmar que la información es verídica",
  }),

  // Antispam — nunca se muestran al usuario. Se revisan aparte, antes de validar el resto.
  sitioWeb: z.string().optional().default(""),
  _t: z.number(),
});

export type Solicitud = z.infer<typeof solicitudSchema>;

export const PASOS = [
  { id: 1, titulo: "Contacto", campos: ["nombre", "telefono", "email", "canalPreferido"] },
  { id: 2, titulo: "Ubicación", campos: ["departamento", "municipio", "barrioVereda"] },
  {
    id: 3,
    titulo: "Tu caso",
    campos: [
      "tipoAyuda",
      "descripcion",
      "urgencia",
      "personasAfectadas",
      "condicionEspecial",
      "tieneAbogado",
      "aceptaTratamientoDatos",
      "confirmaVeracidad",
    ],
  },
] as const;

export const TIPOS_AYUDA_LIST = TIPOS_AYUDA;
export const CONDICIONES_ESPECIALES_LIST = CONDICIONES_ESPECIALES;
