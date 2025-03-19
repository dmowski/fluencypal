/*
 * For more info see
 * https://nextjs.org/docs/app/building-your-application/routing/internationalization
 * */
import { type NextRequest, NextResponse } from "next/server";

import Negotiator from "negotiator";
import linguiConfig from "../lingui.config";

const { locales } = linguiConfig;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale: string) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  const currentQuery = request.nextUrl.searchParams.toString();

  if (pathnameHasLocale) {
    const response = NextResponse.next();
    response.headers.set("x-current-path", request.nextUrl.pathname);
    response.headers.set("x-current-query", currentQuery);
    return response;
  }

  // Detect preferred language
  const locale = getRequestLocale(request.headers);

  // Set a custom header with the preferred locale
  const response = NextResponse.next();
  response.headers.set("X-Preferred-Locale", locale);
  response.headers.set("x-current-path", request.nextUrl.pathname);
  response.headers.set("x-current-query", currentQuery);

  return response;
}

function getRequestLocale(requestHeaders: Headers): string {
  const langHeader = requestHeaders.get("accept-language") || undefined;
  const languages = new Negotiator({
    headers: { "accept-language": langHeader },
  }).languages(locales.slice());

  const activeLocale = languages[0] || locales[0] || "en";

  return activeLocale;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
