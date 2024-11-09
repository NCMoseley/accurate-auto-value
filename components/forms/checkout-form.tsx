"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const formRef = useRef<HTMLFormElement | null>(null);
  const t = useTranslations("CheckoutForm");
  const [loading] = useState<boolean>(false);
  const [input, setInput] = useState<{
    paymentAmount: number;
  }>({
    paymentAmount: config.MIN_AMOUNT,
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit(); // Trigger form submission
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const formAction = async (data: FormData): Promise<void> => {
    const uiMode = data.get(
      "uiMode",
    ) as Stripe.Checkout.SessionCreateParams.UiMode;

    const { client_secret, url } = await createCheckoutSession(data);

    if (uiMode === "embedded") return setClientSecret(client_secret);

    window.location.assign(url as string);
  };

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
        <form
          ref={formRef}
          className="flex w-full flex-col"
          action={formAction}
        >
          <input type="hidden" name="uiMode" value={props.uiMode} />
          <input
            type="hidden"
            name="paymentAmount"
            className="mb-[200px]"
            value={input.paymentAmount}
          />
          {/* <Button
            type="submit"
            className="mb-4 w-full rounded bg-red-500 px-4 py-2 font-bold text-white transition duration-300 hover:bg-red-700"
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
          </Button> */}
        </form>
      )}
    </>
  );
}
