import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js App Router inyecta scripts inline (self.__next_f.push(...)) para
// transmitir el payload de RSC al cliente. Con `script-src 'self'` a secas,
// el navegador los bloquea y la hidratación falla. Generamos un nonce por
// request; Next lo aplica automáticamente a esos scripts inline.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const esDesarrollo = process.env.NODE_ENV !== "production";

  const CSP = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${esDesarrollo ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    esDesarrollo ? "connect-src 'self' ws:" : "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", CSP);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", CSP);

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
