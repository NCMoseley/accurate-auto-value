import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware({
  // Make sure these match your configuration
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: routing.localePrefix,
});

export const config = {
  // Update your matcher to include all paths:
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
