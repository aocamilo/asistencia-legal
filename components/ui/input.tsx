import { type ComponentProps } from "react";

// text-base = 16px: por debajo de eso, iOS Safari hace zoom automático al enfocar.
const BASE =
  "w-full min-h-11 rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 disabled:cursor-not-allowed disabled:bg-neutral-100 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/20";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${BASE} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${BASE} min-h-32 resize-y ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${BASE} pr-8 ${className}`} {...props} />;
}
