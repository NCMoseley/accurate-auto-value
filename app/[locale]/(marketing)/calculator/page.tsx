import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComparePlans } from "@/components/pricing/compare-plans";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { PricingFaq } from "@/components/pricing/pricing-faq";

export const metadata = constructMetadata({
  title: "Pricing - Accurate Auto Value",
  description: "Explore our subscription plans.",
});

export default async function CalculatorPage() {
  const user = await getCurrentUser();
  const [loading, setLoading] = useState(false);

  async function fetchDropDownOptions() {
    setLoading(true);
    return await fetch(
      `https://public.opendatasoft.com/api/records/1.0/search/?rows=0&facet=make&facet=model&facet=cylinders&facet=drive&facet=eng_dscr&facet=fueltype&facet=fueltype1&facet=mpgdata&facet=phevblended&facet=trany&facet=vclass&facet=year&facetsort.year=-count&dataset=all-vehicles-model&timezone=Europe%2FBerlin&lang=en`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          charset: "utf-8",
        },
      },
    ).then(async (res) => {
      if (res.status === 200) {
        // delay to allow for the route change to complete
        await new Promise((resolve) =>
          setTimeout(() => {
            console.log("res:", res);
            resolve(res.json());
          }, 500),
        );
      } else {
        setLoading(false);
        const error = await res.text();
        throw error;
      }
    });
  }

  useEffect(() => {
    fetchDropDownOptions();
  }, []);

  // if (user?.role === "ADMIN") {
  //   return (
  //     <div className="flex min-h-screen flex-col items-center justify-center">
  //       <h1 className="text-5xl font-bold">Seriously?</h1>
  //       <Image
  //         src="/_static/illustrations/call-waiting.svg"
  //         alt="403"
  //         width={560}
  //         height={560}
  //         className="pointer-events-none -my-20 dark:invert"
  //       />
  //       <p className="text-balance px-4 text-center text-2xl font-medium">
  //         You are an {user.role}. Back to{" "}
  //         <Link
  //           href="/admin"
  //           className="text-muted-foreground underline underline-offset-4 hover:text-purple-500"
  //         >
  //           Dashboard
  //         </Link>
  //         .
  //       </p>
  //     </div>
  //   );
  // }

  let subscriptionPlan;
  if (user && user.id) {
    subscriptionPlan = await getUserSubscriptionPlan(user.id);
  }

  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <Button
        variant={loading ? "disable" : "destructive"}
        disabled={loading}
        onClick={fetchDropDownOptions}
      >
        Confirm delete account
      </Button>
      <PricingCards userId={user?.id} subscriptionPlan={subscriptionPlan} />
      <hr className="container" />
      <ComparePlans />
      <PricingFaq />
    </div>
  );
}
