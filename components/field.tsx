import { type ReactNode } from "react";

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-neutral-800">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-neutral-500">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function FieldGroup({
  legend,
  hint,
  error,
  required,
  children,
}: {
  legend: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-base font-medium text-neutral-800">
        {legend}
        {required && <span className="text-red-600"> *</span>}
      </legend>
      {hint && <p className="text-sm text-neutral-500">{hint}</p>}
      <div className="flex flex-col gap-2">{children}</div>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function fieldDescribedBy(id: string, hasHint: boolean, hasError: boolean): string | undefined {
  const parts: string[] = [];
  if (hasHint) parts.push(`${id}-hint`);
  if (hasError) parts.push(`${id}-error`);
  return parts.length > 0 ? parts.join(" ") : undefined;
}
