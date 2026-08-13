import { type ComponentProps } from "react";

type Variante = "primario" | "secundario";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 disabled:bg-neutral-300 disabled:text-neutral-500",
  secundario:
    "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 disabled:text-neutral-400",
};

export function Button({
  variante = "primario",
  className = "",
  ...props
}: ComponentProps<"button"> & { variante?: Variante }) {
  return (
    <button
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-lg px-5 text-base font-medium transition-colors disabled:cursor-not-allowed sm:w-auto ${VARIANTES[variante]} ${className}`}
      {...props}
    />
  );
}
