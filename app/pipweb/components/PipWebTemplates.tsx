import Image from "next/image";
import PipWebTemplateActions from "@/app/pipweb/components/PipWebTemplateActions";
import { PIPWEB_TEMPLATES } from "@/app/pipweb/data/templates";

function TemplatePreview({
  src,
  alt,
  live,
}: {
  src: string;
  alt: string;
  live: boolean;
}) {
  return (
    <div className="relative aspect-[16/10] min-h-[11.5rem] overflow-hidden rounded-xl sm:min-h-[12.5rem]">
      <Image
        src={src}
        alt={alt}
        fill
        quality={65}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#020817]/40 via-transparent to-[#020817]/15"
      />
      {live ? (
        <span className="absolute right-3 top-2 rounded-full bg-[#3B82F6] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          Live demo
        </span>
      ) : null}
    </div>
  );
}

export default function PipWebTemplates() {
  return (
    <section
      id="templates"
      aria-labelledby="pipweb-templates-heading"
      className="relative mx-auto max-w-6xl scroll-mt-24 overflow-x-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="pipweb-templates-heading"
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Choose Your Website Design
        </h2>
        <p className="mt-4 text-[15px] leading-7 text-slate-300 sm:text-lg">
          Choose a design you love. We&apos;ll customize it for your business.
        </p>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {PIPWEB_TEMPLATES.map((template) => {
          const live = Boolean(template.previewUrl);

          return (
            <li
              key={template.id}
              className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-[#0F172A] p-4 transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,8,23,0.45)] sm:p-5 ${
                live
                  ? "border-[#3B82F6]/35 hover:border-[#60A5FA]/50"
                  : "border-white/10 hover:border-[#3B82F6]/35"
              }`}
            >
              <TemplatePreview
                src={template.image ?? `/pipweb/templates/thumbnails/${template.id}.jpg`}
                alt={`${template.name} website design preview`}
                live={live}
              />
              <h3 className="mt-5 text-[17px] font-semibold leading-snug text-white sm:text-lg">
                {template.name}
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-6 text-slate-400">
                {template.description}
              </p>
              <PipWebTemplateActions
                id={template.id}
                name={template.name}
                previewUrl={template.previewUrl}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
