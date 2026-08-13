import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GraciasPage(props: PageProps<"/gracias">) {
  const searchParams = await props.searchParams;
  const folioParam = searchParams.folio;
  const folio = Array.isArray(folioParam) ? folioParam[0] : folioParam;

  if (!folio) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl" aria-hidden="true">
        ✓
      </div>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Recibimos tu solicitud</h1>
        <p className="mt-2 text-base text-neutral-600">
          Un abogado voluntario revisará tu caso y te contactará pronto. Guarda este número, te será útil si
          necesitas hacer seguimiento:
        </p>
      </div>
      <p className="select-all rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-4 text-2xl font-bold tracking-wide text-emerald-800">
        {folio}
      </p>
      <div className="text-left text-sm text-neutral-600">
        <p className="font-semibold text-neutral-800">¿Qué sigue?</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Un miembro del equipo jurídico revisa tu solicitud según la urgencia que reportaste.</li>
          <li>Te contactaremos por el canal que elegiste, usualmente en 1 a 3 días.</li>
          <li>Ten a la mano tus documentos si los tienes: no es obligatorio para pedir ayuda.</li>
        </ul>
      </div>
      <Link href="/" className="text-sm font-medium text-emerald-700 underline">
        Volver al inicio
      </Link>
    </div>
  );
}
