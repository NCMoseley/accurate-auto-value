import "server-only";
import Stripe from "stripe"

import { env } from "@/env.mjs"

// This is the original code from the starter project
// export const stripe = new Stripe(env.STRIPE_API_KEY, {
//   apiVersion: "2024-04-10",
//   typescript: true,
// })

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2024-04-10",
  appInfo: {
    name: "accurate-auto-value",
    url: "https://accurate-auto-value.vercel.app/",
  },
});