import { type ComponentProps } from "react";

/** Checkbox con área de toque ampliada: toda la fila es clicable, no solo la casilla. */
export function CheckboxRow({
  label,
  className = "",
  id,
  ...props
}: ComponentProps<"input"> & { label: React.ReactNode; id: string }) {
  return (
    <label
      htmlFor={id}
      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg py-2 text-base text-neutral-800 ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-neutral-400 text-emerald-700 focus:ring-2 focus:ring-emerald-600/30"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

/** Checkbox de "tarjeta" para selección múltiple (tipo de ayuda, condición especial). */
export function CheckboxCard({
  label,
  className = "",
  id,
  ...props
}: ComponentProps<"input"> & { label: React.ReactNode; id: string }) {
  return (
    <label
      htmlFor={id}
      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base text-neutral-800 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        className="h-5 w-5 shrink-0 rounded border-neutral-400 text-emerald-700 focus:ring-2 focus:ring-emerald-600/30"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
