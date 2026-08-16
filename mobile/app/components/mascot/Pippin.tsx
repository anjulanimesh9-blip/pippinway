"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Pippin() {
  const [x, setX] = useState(-150);

  useEffect(() => {
    const timer = setInterval(() => {
      setX((prev) => {
        if (prev > window.innerWidth + 150) {
          return -150;
        }

        return prev + 2;
      });
    }, 16);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        bottom: 25,
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      <Image
        src="/pippin-wave.png"
        alt="Pippin"
        width={110}
        height={110}
        priority
        style={{
          width: 110,
          height: "auto",
          animation: "walk 0.45s infinite alternate",
        }}
      />
    </div>
  );
}