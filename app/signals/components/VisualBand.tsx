import type { ReactNode } from "react";
import Image from "next/image";

type VisualBandProps = {
  src: string;
  alt: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  priority?: boolean;
};

export function VisualBand({ src, alt, eyebrow, title, children, priority = false }: VisualBandProps) {
  return (
    <section className="pw-signals-glass overflow-hidden rounded-3xl">
      <div className="relative min-h-[168px] sm:min-h-[200px]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={65}
          sizes="(max-width: 768px) 100vw, 1152px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020817]/92 via-[#020817]/78 to-[#020817]/40" />
        <div className="relative z-10 max-w-2xl px-5 py-6 sm:px-7 sm:py-8">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FBB03B]">{eyebrow}</p>
          )}
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h2>
          <div className="mt-2 text-sm leading-6 text-slate-300">{children}</div>
        </div>
      </div>
    </section>
  );
}
