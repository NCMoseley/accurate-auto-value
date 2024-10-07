import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import type { LocalePrefix } from "node_modules/next-intl/dist/types/src/routing/types";

const localePrefix: LocalePrefix = "as-needed";

export const displayConfig = {
  locales: [
    { id: "en", name: "English" },
    { id: "fr", name: "Français" },
    { id: "it", name: "Italiano" },
    { id: "de", name: "Deutsch" },
  ],
  localePrefix,
};

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: displayConfig.locales.map((locale) => locale.id),

  // Used when no locale matches
  defaultLocale: "en",
  localePrefix,
});

export const AllLocales = routing.locales;

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
