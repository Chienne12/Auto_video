import { NextRequest, NextResponse } from "next/server";

import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { Lang, defaultLocale, locales } from "@/i18n/config";

function getLocale(request: NextRequest): Lang {
  const headers = {
    "accept-language": request.headers.get("accept-language") || "",
  };

  const negotiator = new Negotiator({ headers });
  const languages = negotiator.languages();

  return match(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest): Response | void {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  const redirectURL = new URL(request.nextUrl);
  redirectURL.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(redirectURL);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images/*|favicon.ico).*)"],
};
