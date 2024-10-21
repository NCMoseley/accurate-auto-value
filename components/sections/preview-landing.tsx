"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import "./styles.css";

import { useState } from "react";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => {
    const delay = 1 + i * 0.5;
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    };
  },
};

const hiddenMask = `repeating-linear-gradient(to right, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 30px, rgba(0,0,0,1) 30px, rgba(0,0,0,1) 30px)`;
const visibleMask = `repeating-linear-gradient(to right, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 30px)`;

function BlindsImage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  return (
    <section>
      <motion.div
        initial={false}
        animate={
          isLoaded && isInView
            ? { WebkitMaskImage: visibleMask, maskImage: visibleMask }
            : { WebkitMaskImage: hiddenMask, maskImage: hiddenMask }
        }
        transition={{ duration: 1, delay: 1 }}
        viewport={{ once: true }}
        onViewportEnter={() => setIsInView(true)}
      >
        <Image
          // className="size-full object-cover object-center dark:opacity-85 dark:invert"
          className="size-full object-cover object-center dark:opacity-35"
          src="/images/finger-pressing-keyless-ingnition-car-valuation.png"
          alt="preview landing"
          width={2000}
          height={1000}
          priority={true}
          onLoad={() => setIsLoaded(true)}
        />
      </motion.div>
    </section>
  );
}

export default function PreviewLanding() {
  return (
    <div className="pb-6 sm:pb-6">
      <MaxWidthWrapper>
        {/* <motion.svg
          width="600"
          height="600"
          viewBox="0 0 600 600"
          initial="hidden"
          animate="visible"
        >
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke="#ff0055"
            variants={draw}
            custom={1}
          />
          <motion.line
            x1="220"
            y1="30"
            x2="360"
            y2="170"
            stroke="#00cc88"
            variants={draw}
            custom={2}
          />
          <motion.line
            x1="220"
            y1="170"
            x2="360"
            y2="30"
            stroke="#00cc88"
            variants={draw}
            custom={2.5}
          />
        </motion.svg> */}
        <div className="rounded-xl md:bg-muted/30 md:p-3.5 md:ring-1 md:ring-inset md:ring-border">
          <div className="relative aspect-video overflow-hidden rounded-xl border md:rounded-lg">
            {/* <BlindsImage /> */}
            <Image
              // className="size-full object-cover object-center dark:opacity-85 dark:invert"
              className="size-full object-cover object-center dark:opacity-35"
              src="/images/finger-pressing-keyless-ingnition-car-valuation.png"
              alt="preview landing"
              width={2000}
              height={1000}
              priority={true}
            />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
