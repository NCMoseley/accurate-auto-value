import { Metadata } from "next";
import { clsx, type ClassValue } from "clsx";
import ms from "ms";
import { twMerge } from "tailwind-merge";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";
import { SafeForDropdown } from "../types";
import { getLocale } from 'next-intl/server';

export const MILLISECONDS_IN_ONE_DAY = 86_400_000;

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

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
  return `${env.NEXT_PUBLIC_APP_URL}${path}`;
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

export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const truncate = (str: string, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
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

export const placeholderBlurhash =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAoJJREFUWEfFl4lu4zAMRO3cx/9/au6reMaOdkxTTl0grQFCRoqaT+SQotq2bV9N8rRt28xms87m83l553eZ/9vr9Wpkz+ezkT0ej+6dv1X81AFw7M4FBACPVn2c1Z3zLgDeJwHgeLFYdAARYioAEAKJEG2WAjl3gCwNYymQQ9b7/V4spmIAwO6Wy2VnAMikBWlDURBELf8CuN1uHQSrPwMAHK5WqwFELQ01AIXdAa7XawfAb3p6AOwK5+v1ugAoEq4FRSFLgavfQ49jAGQpAE5wjgGCeRrGdBArwHOPcwFcLpcGU1X0IsBuN5tNgYhaiFFwHTiAwq8I+O5xfj6fOz38K+X/fYAdb7fbAgFAjIJ6Aav3AYlQ6nfnDoDz0+lUxNiLALvf7XaDNGQ6GANQBKR85V27B4D3QQRw7hGIYlQKWGM79hSweyCUe1blXhEAogfABwHAXAcqSYkxCtHLUK3XBajSc4Dj8dilAeiSAgD2+30BAEKV4GKcAuDqB4TdYwBgPQByCgApUBoE4EJUGvxUjF3Q69/zLw3g/HA45ABKgdIQu+JPIyDnisCfAxAFNFM0EFNQ64gfS0EUoQP8ighrZSjn3oziZEQpauyKbfjbZchHUL/3AS/Dd30gAkxuRACgfO+EWQW8qwI1o+wseNuKcQiESjALvwNoMI0TcRzD4lFcPYwIM+JTF5x6HOs8yI7jeB5oKhpMRFH9UwaSCDB2Jmg4rc6E2TT0biIaG0rQhNqyhpHBcayTTSXH6vcDL7/sdqRK8LkwTsU499E8vRcAojHcZ4AxABdilgrp4lsXk8oVqgwh7+6H3phqd8J0Kk4vbx/+sZqCD/vNLya/5dT9fAH8g1WdNGgwbQAAAABJRU5ErkJggg==";


export function deriveDropdownValues(data: SafeForDropdown[]) {
  return data.map((item) => ({
    label: item.name,
    value: item.name,
  }));
};

export async function fetchTranslations() {
  const locale = await getLocale();
  return locale;
};

export const makes = [
  { label: "vw", value: "vw" },
  { label: "mercedes-benz", value: "mercedes-benz" },
  { label: "bmw", value: "bmw" },
  { label: "audi", value: "audi" },
  { label: "skoda", value: "skoda" },
  { label: "ford", value: "ford" },
  { label: "renault", value: "renault" },
  { label: "toyota", value: "toyota" },
  { label: "volvo", value: "volvo" },
  { label: "peugeot", value: "peugeot" },
  { label: "opel", value: "opel" },
  { label: "fiat", value: "fiat" },
  { label: "porsche", value: "porsche" },
  { label: "hyundai", value: "hyundai" },
  { label: "seat", value: "seat" },
  { label: "citroen", value: "citroen" },
  { label: "mazda", value: "mazda" },
  { label: "mini", value: "mini" },
  { label: "nissan", value: "nissan" },
  { label: "land rover", value: "land rover" },
  { label: "suzuki", value: "suzuki" },
  { label: "subaru", value: "subaru" },
  { label: "jeep", value: "jeep" },
  { label: "kia", value: "kia" },
  { label: "honda", value: "honda" },
  { label: "cupra", value: "cupra" },
  { label: "mitsubishi", value: "mitsubishi" },
  { label: "dacia", value: "dacia" },
  { label: "alfa romeo", value: "alfa romeo" },
  { label: "jaguar", value: "jaguar" },
  { label: "tesla", value: "tesla" },
  { label: "smart", value: "smart" },
  { label: "chevrolet", value: "chevrolet" },
  { label: "maserati", value: "maserati" },
  { label: "ds automobiles", value: "ds automobiles" },
  { label: "ferrari", value: "ferrari" },
  { label: "lexus", value: "lexus" },
  { label: "iveco", value: "iveco" },
  { label: "dodge", value: "dodge" },
  { label: "bentley", value: "bentley" },
  { label: "cadillac", value: "cadillac" },
  { label: "ssang yong", value: "ssang yong" },
  { label: "lamborghini", value: "lamborghini" },
  { label: "daihatsu", value: "daihatsu" },
  { label: "aston martin", value: "aston martin" },
  { label: "chrysler", value: "chrysler" },
  { label: "saab", value: "saab" },
  { label: "lancia", value: "lancia" },
  { label: "bmw-alpina", value: "bmw-alpina" },
  { label: "genesis", value: "genesis" },
  { label: "lotus", value: "lotus" },
  { label: "rolls-royce", value: "rolls-royce" },
  { label: "polestar", value: "polestar" },
  { label: "isuzu", value: "isuzu" }
];