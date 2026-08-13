import Link from "next/link";

export const metadata = {
  title: "Política de privacidad — Asistencia Legal Terremoto",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm font-medium text-emerald-700 underline">
        ← Volver al formulario
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">Política de tratamiento de datos personales</h1>
      <p className="mt-2 text-sm text-neutral-500">
        De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.
      </p>

      <div className="mt-6 flex flex-col gap-6 text-base text-neutral-700">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Responsable del tratamiento</h2>
          <p className="mt-1">
            Este formulario es operado por un grupo voluntario de profesionales del derecho que ofrece
            asesoría jurídica gratuita a personas afectadas por el terremoto en Colombia. El proyecto es de
            código abierto y sin ánimo de lucro.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Qué datos recolectamos</h2>
          <p className="mt-1">
            Solo lo necesario para contactarte y entender tu caso: nombre, celular, correo opcional,
            ubicación general (departamento, municipio y barrio o vereda, nunca tu dirección exacta),
            descripción de tu situación y datos relevantes para priorizar la atención. No pedimos número de
            cédula ni información bancaria en este formulario.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Para qué usamos tus datos</h2>
          <p className="mt-1">
            Exclusivamente para que un abogado voluntario te contacte y te brinde asesoría jurídica gratuita
            relacionada con tu situación tras el terremoto. No usamos tus datos con fines comerciales, no los
            vendemos ni los compartimos con terceros ajenos al equipo de asesoría.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Dónde se almacenan</h2>
          <p className="mt-1">
            Tu solicitud se guarda en una hoja de cálculo de Google gestionada por el equipo coordinador, con
            acceso restringido a las personas que atienden los casos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Cuánto tiempo la conservamos</h2>
          <p className="mt-1">
            Mientras tu caso esté activo y por un periodo razonable después para fines de seguimiento. Puedes
            solicitar que eliminemos tus datos en cualquier momento.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Tus derechos (derechos ARCO)</h2>
          <p className="mt-1">
            Puedes conocer, actualizar, rectificar o solicitar la eliminación de tus datos personales, así
            como revocar tu autorización en cualquier momento, escribiendo al correo de contacto del equipo
            coordinador.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Contacto</h2>
          <p className="mt-1">
            Para ejercer tus derechos o resolver dudas sobre el tratamiento de tus datos, escribe al correo
            de contacto que el equipo coordinador publica junto a este formulario.
          </p>
        </section>
      </div>
    </div>
  );
}
