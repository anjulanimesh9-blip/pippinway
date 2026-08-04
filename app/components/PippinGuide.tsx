"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
  {
    x: 80,
    y: 220,
    text: "Hi 👋 Welcome!",
  },
  {
    x: 650,
    y: 340,
    text: "Featured Ads ⭐",
  },
  {
    x: 700,
    y: 680,
    text: "Latest Listings 🔥",
  },
];

export default function PippinGuide() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      animate={{
        x: steps[step].x,
        y: steps[step].y,
      }}
      transition={{
        duration: 1.5,
      }}
      className="fixed z-[9999]"
    >
      <div className="relative">

        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-violet-600 text-white px-4 py-2 rounded-full shadow-lg">
          {steps[step].text}
        </div>

        <motion.div
          animate={{
            rotate: [-5,5,-5],
          }}
          transition={{
            repeat: Infinity,
            duration: 1,
          }}
        >
          <Image
            src="/images/pippin-wave.png"
            width={130}
            height={130}
            alt="Pippin"
          />
        </motion.div>

      </div>
    </motion.div>
  );
}