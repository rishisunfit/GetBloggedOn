import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";

  // Only handle *.bloggish.io subdomains
  if (!host.endsWith(".bloggish.io")) {
    return NextResponse.next();
  }

  const subdomain = host.replace(".bloggish.io", "");

  // Block reserved / non-tenant hosts
  if (!subdomain || subdomain === "www" || subdomain === "bloggish") {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/blog/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};

