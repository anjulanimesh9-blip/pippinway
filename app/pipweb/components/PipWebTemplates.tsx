import PipWebTemplateActions from "@/app/pipweb/components/PipWebTemplateActions";
import { PIPWEB_TEMPLATES } from "@/app/pipweb/data/templates";

const MOCKUP_ACCENT: Record<string, string> = {
  "restaurant-cafe": "from-amber-500/25 via-[#0F172A] to-[#0B1220]",
  "preschool-education": "from-sky-400/25 via-[#0F172A] to-[#0B1220]",
  "salon-beauty": "from-rose-400/25 via-[#0F172A] to-[#0B1220]",
  "car-dealer": "from-slate-400/25 via-[#0F172A] to-[#0B1220]",
  "real-estate": "from-teal-400/25 via-[#0F172A] to-[#0B1220]",
  "corporate-business": "from-blue-500/30 via-[#0F172A] to-[#0B1220]",
};

function TemplateMockup({ id }: { id: string }) {
  const accent = MOCKUP_ACCENT[id] ?? "from-[#3B82F6]/20 via-[#0F172A] to-[#0B1220]";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${accent}`}
      aria-hidden
    >
      <div className="flex h-7 items-center gap-1.5 bg-[#07111F]/80 px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="ml-2 h-3 flex-1 rounded-sm bg-white/10" />
      </div>
      <div className="aspect-[16/10] p-3 sm:p-4">
        <div className="h-3 w-1/3 rounded bg-white/20" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-16 rounded-lg bg-white/10 sm:h-[4.5rem]" />
          <div className="h-16 rounded-lg bg-white/15 sm:h-[4.5rem]" />
          <div className="h-16 rounded-lg bg-white/10 sm:h-[4.5rem]" />
        </div>
        <div className="mt-2 h-2 w-2/3 rounded bg-white/15" />
        <div className="mt-1.5 h-2 w-1/2 rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function PipWebTemplates() {
  return (
    <section
      id="templates"
      aria-labelledby="pipweb-templates-heading"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
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

      <ul className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {PIPWEB_TEMPLATES.map((template) => (
          <li
            key={template.id}
            className="flex flex-col rounded-2xl border border-white/10 bg-[#0F172A] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/40 hover:bg-[#132038] sm:p-6"
          >
            <TemplateMockup id={template.id} />
            <h3 className="mt-4 text-base font-semibold text-white sm:text-[17px]">
              {template.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
              {template.description}
            </p>
            <PipWebTemplateActions
              id={template.id}
              name={template.name}
              previewUrl={template.previewUrl}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
