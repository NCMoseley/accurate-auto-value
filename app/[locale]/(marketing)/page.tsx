import { useLocale } from "next-intl";

import { infos } from "@/config/landing";
import { AutoValueForm } from "@/components/forms/auto-value-form";
import BentoGrid from "@/components/sections/bentogrid";
import Features from "@/components/sections/features";
import HeroLanding from "@/components/sections/hero-landing";
import InfoLanding from "@/components/sections/info-landing";
import Powered from "@/components/sections/powered";
import PreviewLanding from "@/components/sections/preview-landing";
import Testimonials from "@/components/sections/testimonials";

export default function IndexPage() {
  const locale = useLocale();
  if (locale) {
    // localStorage.setItem("locale", locale);
  }
  return (
    <>
      <HeroLanding />
      <AutoValueForm initialStage={2} />
      <PreviewLanding />
      {/* <Powered /> */}
      {/* <BentoGrid /> */}
      {/* <InfoLanding data={infos[0]} reverse={true} /> */}
      {/* <InfoLanding data={infos[1]} /> */}
      {/* <Features /> */}
      <Testimonials />
    </>
  );
}
