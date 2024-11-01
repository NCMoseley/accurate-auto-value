"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { confirmPayment, createCheckoutSession } from "@/actions/stripe";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import type Stripe from "stripe";

import * as config from "@/config/stripe";
import getStripe from "@/lib/get-stripe";
import { formatAmountForDisplay } from "@/lib/stripe-helpers";
import { Button } from "@/components/ui/button";

import { Icons } from "../shared/icons";

interface CheckoutFormProps {
  uiMode: Stripe.Checkout.SessionCreateParams.UiMode;
}

export default function CheckoutForm(props: CheckoutFormProps): JSX.Element {
  const t = useTranslations("CheckoutForm");
  const router = useSearchParams();
  const session_id = router.get("session_id");
  const [loading] = useState<boolean>(false);
  const [input, setInput] = useState<{ paymentAmount: number }>({
    paymentAmount: config.MAX_AMOUNT,
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);

  useEffect(() => {
    console.log("sessionId", session_id);
    if (session_id) {
      confirmPayment(session_id).then((confirmed) => {
        setPaymentConfirmed(confirmed);
      });
    }
  }, [session_id]);

  const formAction = async (data: FormData): Promise<void> => {
    const uiMode = data.get(
      "uiMode",
    ) as Stripe.Checkout.SessionCreateParams.UiMode;
    const { client_secret, url } = await createCheckoutSession(data);

    if (uiMode === "embedded") return setClientSecret(client_secret);

    window.location.assign(url as string);
  };

  if (paymentConfirmed) {
    return <div>Payment confirmed</div>;
  }

  return (
    <>
      {clientSecret ? (
        <EmbeddedCheckoutProvider
          stripe={getStripe()}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="uiMode" value={props.uiMode} />
          <input
            type="hidden"
            name="paymentAmount"
            value={input.paymentAmount}
          />
          <Button
            type="submit"
            className="gradient_indigo-purple mb-4 w-full rounded px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Icons.spinner className="mr-2 size-4 animate-spin" />
                {t("submit.loading")}
              </>
            ) : (
              t("submit.label") +
              " " +
              formatAmountForDisplay(input.paymentAmount, config.CURRENCY)
            )}
          </Button>
        </form>
      )}
    </>
  );
}
