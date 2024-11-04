import { SidebarNavItem, SiteConfig } from "types";
// import { env } from "@/env.mjs";

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

const site_url = BASE_URL;

export const siteConfig: SiteConfig = {
  name: "CAR VAL APP",
  description:
    "Get a fair and accurate value for your car in minutes.",
  url: site_url,
  // ogImage: `${site_url}/_static/og.jpg`,
  ogImage: ``,
  links: {
    // linkedin: "https://www.linkedin.com/in/ncmoseley/",
    github: "https://github.com/ncmoseley/accurate-auto-value",
  },
  mailSupport: "ncmoseley@gmail.com",
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Company",
    items: [
      { title: "About", href: "#" },
      { title: "Enterprise", href: "#" },
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Product",
    items: [
      { title: "Security", href: "#" },
      { title: "Customization", href: "#" },
      { title: "Customers", href: "#" },
      { title: "Changelog", href: "#" },
    ],
  },
  {
    title: "Docs",
    items: [
      { title: "Introduction", href: "#" },
      { title: "Installation", href: "#" },
      { title: "Components", href: "#" },
      { title: "Code Blocks", href: "#" },
    ],
  },
];
