import { Metadata } from "next";
import { clsx, type ClassValue } from "clsx";
import ms from "ms";
import { twMerge } from "tailwind-merge";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";
import { SafeForDropdown } from "../types";
import { getLocale } from 'next-intl/server';

export const MILLISECONDS_IN_ONE_DAY = 86_400_000;

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    keywords: [
      "Next.js",
      "React",
      "Prisma",
      "Neon",
      "Auth.js",
      "shadcn ui",
      "Resend",
      "React Email",
      "Stripe",
    ],
    authors: [
      {
        name: "",
      },
    ],
    creator: "",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteConfig.url,
      title,
      description,
      siteName: title,
    },
    // twitter: {
    //   card: "summary_large_image",
    //   title,
    //   description,
    //   images: [image],
    //   creator: "@nathan",
    // },
    icons,
    metadataBase: new URL(siteConfig.url),
    manifest: `${siteConfig.url}/site.webmanifest`,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function absoluteUrl(path: string) {
  return `${BASE_URL}${path}`;
}

// Utils from precedent.dev
export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
  if (!timestamp) return "never";
  return `${ms(Date.now() - new Date(timestamp).getTime())}${timeOnly ? "" : " ago"
    }`;
};

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const res = await fetch(input, init);

  console.log("res", res);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  return res.json();
}

export function nFormatter(num: number, digits?: number) {
  if (!num) return "0";
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits || 1).replace(rx, "$1") + item.symbol
    : "0";
}

export function capitalize(str: string | undefined) {
  if (!str || typeof str !== "string") return str;
  // if (str.length <= 3) return str.toUpperCase();
  let strBreak: string = " ";

  if (str.indexOf("-") !== -1) {
    strBreak = "-";
  }

  const strArr = str.split(strBreak);
  const capitalizedArr = strArr.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedArr.join(strBreak)
}

export function truncateWithCapitalization(str: string | undefined, maxLength: number) {
  if (!str || str.length <= maxLength) return capitalize(str);
  return capitalize(`${str.slice(0, maxLength)}...`);
}

export const truncate = (str: string, maxLength: number) => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

export const displayFormat = (value: string | number, length: number) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'string') {
    return capitalize(truncate(value, length));
  }
  return value;
};

export const getBlurDataURL = async (url: string | null) => {
  if (!url) {
    return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  }

  if (url.startsWith("/_static/")) {
    url = `${siteConfig.url}${url}`;
  }

  try {
    const response = await fetch(
      `https://wsrv.nl/?url=${url}&w=50&h=50&blur=5`,
    );
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    return "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  }
};

export function scrollToElement(elementId: string, offset: number = 0) {
  if (typeof document === 'undefined') return;
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'instant', block: 'start' });

    // Calculate the new scroll position
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;

    // Scroll to the new position with the offset
    window.scrollTo({
      top: offsetPosition,
      behavior: 'instant', // Optional: smooth scrolling
    });

  } else {
    console.warn(`Element with ID "${elementId}" not found.`);
  }
}

export const placeholderBlurhash =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAoJJREFUWEfFl4lu4zAMRO3cx/9/au6reMaOdkxTTl0grQFCRoqaT+SQotq2bV9N8rRt28xms87m83l553eZ/9vr9Wpkz+ezkT0ej+6dv1X81AFw7M4FBACPVn2c1Z3zLgDeJwHgeLFYdAARYioAEAKJEG2WAjl3gCwNYymQQ9b7/V4spmIAwO6Wy2VnAMikBWlDURBELf8CuN1uHQSrPwMAHK5WqwFELQ01AIXdAa7XawfAb3p6AOwK5+v1ugAoEq4FRSFLgavfQ49jAGQpAE5wjgGCeRrGdBArwHOPcwFcLpcGU1X0IsBuN5tNgYhaiFFwHTiAwq8I+O5xfj6fOz38K+X/fYAdb7fbAgFAjIJ6Aav3AYlQ6nfnDoDz0+lUxNiLALvf7XaDNGQ6GANQBKR85V27B4D3QQRw7hGIYlQKWGM79hSweyCUe1blXhEAogfABwHAXAcqSYkxCtHLUK3XBajSc4Dj8dilAeiSAgD2+30BAEKV4GKcAuDqB4TdYwBgPQByCgApUBoE4EJUGvxUjF3Q69/zLw3g/HA45ABKgdIQu+JPIyDnisCfAxAFNFM0EFNQ64gfS0EUoQP8ighrZSjn3oziZEQpauyKbfjbZchHUL/3AS/Dd30gAkxuRACgfO+EWQW8qwI1o+wseNuKcQiESjALvwNoMI0TcRzD4lFcPYwIM+JTF5x6HOs8yI7jeB5oKhpMRFH9UwaSCDB2Jmg4rc6E2TT0biIaG0rQhNqyhpHBcayTTSXH6vcDL7/sdqRK8LkwTsU499E8vRcAojHcZ4AxABdilgrp4lsXk8oVqgwh7+6H3phqd8J0Kk4vbx/+sZqCD/vNLya/5dT9fAH8g1WdNGgwbQAAAABJRU5ErkJggg==";

export function deriveDropdownValues(data: SafeForDropdown[] | any[]) {
  if (!data) return [];
  let nomalizedData = data.map((item) => {
    if (typeof item === 'number') {
      return item.toFixed(0);
    }
    return item;
  });
  let uniqueData = nomalizedData.filter((value, index) => nomalizedData.indexOf(value) === index);
  let result: { label: string, value: string }[] = [];
  if (uniqueData[0]?.name) {
    result = uniqueData.map((item) => ({
      label: item.name,
      value: item.name,
    }));
  } else {
    result = uniqueData.map((item) => ({
      label: typeof item === 'number' ? item.toFixed(0) : item,
      value: typeof item === 'number' ? item.toFixed(0) : item,
    }));
  }
  return result.sort((a, b) => a.label.localeCompare(b.label))
};

export async function fetchTranslations() {
  const locale = await getLocale();
  return locale;
};

export const yearsArr = [
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
  { label: "2022", value: "2022" },
  { label: "2021", value: "2021" },
  { label: "2020", value: "2020" },
  { label: "2019", value: "2019" },
  { label: "2018", value: "2018" },
  { label: "2017", value: "2017" },
  { label: "2016", value: "2016" },
  { label: "2015", value: "2015" },
  { label: "2014", value: "2014" },
  { label: "2013", value: "2013" },
  { label: "2012", value: "2012" },
  { label: "2011", value: "2011" },
  { label: "2010", value: "2010" },
  { label: "2009", value: "2009" },
  { label: "2008", value: "2008" },
  { label: "2007", value: "2007" },
  { label: "2006", value: "2006" },
  { label: "2005", value: "2005" },
  { label: "2004", value: "2004" },
  { label: "2003", value: "2003" },
  { label: "2002", value: "2002" },
  { label: "2001", value: "2001" },
  { label: "2000", value: "2000" },
  { label: "1999", value: "1999" },
  { label: "1998", value: "1998" },
  { label: "1997", value: "1997" },
  { label: "1996", value: "1996" },
  { label: "1995", value: "1995" },
  { label: "1994", value: "1994" },
  { label: "1993", value: "1993" },
  { label: "1992", value: "1992" },
  { label: "1991", value: "1991" },
  { label: "1990", value: "1990" },
  { label: "1989", value: "1989" },
  { label: "1988", value: "1988" },
  { label: "1987", value: "1987" },
  { label: "1986", value: "1986" },
  { label: "1985", value: "1985" },
  { label: "1984", value: "1984" },
  { label: "1983", value: "1983" },
  { label: "1982", value: "1982" },
  { label: "1981", value: "1981" },
  { label: "1980", value: "1980" },
  { label: "1979", value: "1979" },
  { label: "1978", value: "1978" },
  { label: "1977", value: "1977" },
  { label: "1976", value: "1976" },
  { label: "1975", value: "1975" },
  { label: "1974", value: "1974" },
  { label: "1973", value: "1973" },
  { label: "1972", value: "1972" },
  { label: "1971", value: "1971" },
  { label: "1970", value: "1970" },
  { label: "1969", value: "1969" },
  { label: "1968", value: "1968" },
  { label: "1967", value: "1967" },
  { label: "1966", value: "1966" },
  { label: "1965", value: "1965" },
  { label: "1964", value: "1964" },
  { label: "1963", value: "1963" },
  { label: "1962", value: "1962" },
  { label: "1961", value: "1961" },
  { label: "1960", value: "1960" },
  { label: "1959", value: "1959" },
  { label: "1958", value: "1958" },
  { label: "1957", value: "1957" },
  { label: "1956", value: "1956" },
  { label: "1955", value: "1955" },
  { label: "1954", value: "1954" },
  { label: "1953", value: "1953" },
  { label: "1952", value: "1952" },
  { label: "1951", value: "1951" },
  { label: "1950", value: "1950" }
];