import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asistencia Legal Terremoto Colombia",
  description:
    "Solicita asesoría jurídica gratuita si el terremoto en Colombia te afectó. Un grupo de abogados voluntarios te contactará.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#047857",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Leer headers() opta esta ruta por renderizado dinámico: es lo que le
  // permite a Next.js generar y aplicar un nonce fresco por request al CSP
  // (ver proxy.ts) en sus scripts inline de hidratación de RSC.
  await headers();

  return (
    <html lang="es-CO" className="h-full antialiased">
      <body className="flex min-h-[100dvh] flex-col bg-white text-neutral-900">
        <header className="border-b border-neutral-200 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">Asistencia Legal Terremoto</p>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-neutral-200 px-4 py-4 text-center text-xs text-neutral-500">
          <p>
            Proyecto comunitario y de código abierto.{" "}
            <a href="/privacidad" className="underline">
              Política de privacidad
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
