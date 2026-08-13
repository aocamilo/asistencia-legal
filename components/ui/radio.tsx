import { type ComponentProps } from "react";

/** Radio de "tarjeta" tocable, usado para elecciones únicas cortas (urgencia, canal). */
export function RadioCard({
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
        type="radio"
        className="h-5 w-5 shrink-0 border-neutral-400 text-emerald-700 focus:ring-2 focus:ring-emerald-600/30"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
