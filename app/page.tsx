import { SolicitudForm } from "@/components/solicitud-form";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pb-2 pt-6 text-center sm:pt-10">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          Asesoría jurídica gratuita para afectados por el terremoto
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-neutral-600">
          Un grupo de abogados voluntarios está listo para ayudarte con vivienda, arriendos, seguros,
          documentos y más. Completa este formulario y te contactaremos.
        </p>
      </div>
      <SolicitudForm />
    </div>
  );
}
