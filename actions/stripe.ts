"use server";

import type { Stripe } from "stripe";
import { headers } from "next/headers";
import { CURRENCY } from "@/config/stripe";
import { formatAmountForStripe } from "@/lib/stripe-helpers";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(
  data: FormData,
): Promise<{ client_secret: string | null; url: string | null }> {
  console.log("createCheckoutSession data", data);
  const ui_mode = data.get(
    "uiMode",
  ) as Stripe.Checkout.SessionCreateParams.UiMode;

  const origin: string = headers().get("origin") as string;

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "pay",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: "Fee for valuation",
            },
            unit_amount: formatAmountForStripe(
              Number(data.get("paymentAmount") as string),
              CURRENCY,
            ),
          },
        },
      ],
      ...(ui_mode === "hosted" && {
        success_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
      }),
      // ...(ui_mode === "embedded" && {
      //   return_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
      // }),
      // ...(ui_mode === "hosted" && {
      //   success_url: `${origin}/result`,
      //   cancel_url: `${origin}`,
      // }),
      ...(ui_mode === "embedded" && {
        return_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
      }),
      ui_mode,
    });

  // console.log("checkoutSession", checkoutSession);

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}

export async function confirmPayment(session_id: string): Promise<boolean> {
  console.log("confirmPayment session_id", session_id);
  if (session_id) {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    // Check the session status
    if (session.payment_status === "paid") {
      // Payment was successful
      console.log("Payment successful!");
      return true;
    } else {
      // Handle payment failure
      console.log("Payment not successful.");
      return false;
    }
  }
  return false;
};

export async function createPaymentIntent(
  data: FormData,
): Promise<{ client_secret: string }> {
  const paymentIntent: Stripe.PaymentIntent =
    await stripe.paymentIntents.create({
      amount: formatAmountForStripe(
        Number(data.get("paymentAmount") as string),
        CURRENCY,
      ),
      automatic_payment_methods: { enabled: true },
      currency: CURRENCY,
    });

  return { client_secret: paymentIntent.client_secret as string };
}