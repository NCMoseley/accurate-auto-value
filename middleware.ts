import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export { auth as middleware } from "@/auth";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fr|en)/:path*"],
};
