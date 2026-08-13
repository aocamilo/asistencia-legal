import type { NextConfig } from "next";

// En desarrollo, el HMR y el overlay de errores de Next inyectan scripts
// inline y usan eval — 'self' a secas los bloquea. Solo relajamos el CSP en
// dev; en producción se sirve el estricto.
const esDesarrollo = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  esDesarrollo ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  esDesarrollo ? "connect-src 'self' ws:" : "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
