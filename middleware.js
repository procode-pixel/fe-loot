import { NextResponse } from "next/server";

const PROBES = [
  "/.env",
  "/wp-admin",
  "/wp-login",
  "/wp-login.php",
  "/phpmyadmin",
  "/.git",
  "/xmlrpc.php",
  "/vendor/phpunit",
  "/cgi-bin",
  "/actuator",
  "/server-status",
  "/.aws",
  "/.ssh",
  "/config.json",
  "/wp-content",
  "/backup",
  "/.env.local",
  "/.env.production",
  "/api/env"
];

export function middleware(req) {
  const path = req.nextUrl.pathname.toLowerCase();
  if (PROBES.some((p) => path === p || path.startsWith(p + "/") || path.includes(p))) {
    return new NextResponse("not found", { status: 404 });
  }
  if (path.endsWith(".php") || path.includes("..") || path.includes("%2e%2e") || path.includes("%00")) {
    return new NextResponse("not found", { status: 404 });
  }
  const len = Number(req.headers.get("content-length") || 0);
  if (len > 100_000) return NextResponse.json({ error: "الطلب كبير جداً." }, { status: 413 });

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS" && path.startsWith("/api/")) {
    const allowed = ["POST", "PUT", "PATCH", "DELETE"];
    if (!allowed.includes(req.method)) {
      return NextResponse.json({ error: "طريقة غير مسموحة." }, { status: 405 });
    }
    const host = req.headers.get("host") || "";
    const origin = req.headers.get("origin");
    const fetchSite = (req.headers.get("sec-fetch-site") || "").toLowerCase();
    if (fetchSite === "cross-site") {
      return NextResponse.json({ error: "طلب خارجي مرفوض." }, { status: 403 });
    }
    if (origin) {
      try {
        if (new URL(origin).host !== host) {
          return NextResponse.json({ error: "أصل الطلب غير مسموح." }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "أصل الطلب غير صالح." }, { status: 403 });
      }
    } else if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none") {
      return NextResponse.json({ error: "أصل الطلب مطلوب." }, { status: 403 });
    }
  }
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
