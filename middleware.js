import { NextResponse } from "next/server";

const PROBES = [
  "/.env",
  "/wp-admin",
  "/wp-login",
  "/phpmyadmin",
  "/.git",
  "/xmlrpc.php",
  "/vendor/phpunit",
  "/cgi-bin"
];

export function middleware(req) {
  const path = req.nextUrl.pathname.toLowerCase();
  if (PROBES.some((p) => path === p || path.startsWith(p + "/") || path.includes(p))) {
    return new NextResponse("not found", { status: 404 });
  }
  if (path.endsWith(".php") || path.includes("..")) {
    return new NextResponse("not found", { status: 404 });
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  if (req.method !== "GET" && req.method !== "HEAD" && path.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) {
          return NextResponse.json({ error: "أصل الطلب غير مسموح." }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "أصل الطلب غير صالح." }, { status: 403 });
      }
    }
  }
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
