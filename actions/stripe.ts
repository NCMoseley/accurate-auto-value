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
      phone_number_collection: { enabled: true },
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

export async function confirmPayment(session_id: string): Promise<{ confirmed: boolean, email: string, name: string, phone: string }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return {
      confirmed: session.payment_status === "paid",
      email: session.customer_details?.email || "",
      name: session.customer_details?.name || "",
      phone: session.customer_details?.phone || "",
    }
  } catch (error) {
    console.error("ConfirmPayment error", error);
    return {
      confirmed: false,
      email: "",
      name: "",
      phone: "",
    };
  }
}