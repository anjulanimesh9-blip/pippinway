import type { ReactNode } from "react";

type PatternCard = {
  name: string;
  bias: "Bullish" | "Bearish" | "Either";
  developing: string;
  confirmed: string;
  diagram: ReactNode;
};

function ChartFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 220 120" className="h-auto w-full" role="img" aria-hidden>
      <rect width="220" height="120" rx="10" fill="#0B1220" />
      <path d="M16 16v88h188" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {children}
    </svg>
  );
}

const PATTERNS: PatternCard[] = [
  {
    name: "Bullish Flag",
    bias: "Bullish",
    developing: "A sharp rise (pole) is followed by a downward-sloping channel. Price is still inside the flag.",
    confirmed: "A close above the upper flag line after the pole. The illustration is educational, not a live signal.",
    diagram: (
      <ChartFrame>
        <path d="M28 88 L70 28" stroke="#34d399" strokeWidth="2.4" fill="none" />
        <path d="M70 28 L118 48 L160 32" stroke="#94a3b8" strokeWidth="1.6" fill="none" />
        <path d="M74 40 L162 22" stroke="#FBB03B" strokeWidth="1" strokeDasharray="4 3" />
        <path d="M78 56 L166 38" stroke="#FBB03B" strokeWidth="1" strokeDasharray="4 3" />
        <path d="M160 32 L188 18" stroke="#34d399" strokeWidth="2" markerEnd="url(#pw-up)" />
        <text x="40" y="72" fill="#94a3b8" fontSize="8">Pole</text>
        <text x="108" y="66" fill="#FBB03B" fontSize="8">Flag</text>
        <text x="168" y="14" fill="#34d399" fontSize="8">Breakout</text>
        <defs>
          <marker id="pw-up" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" fill="#34d399" />
          </marker>
        </defs>
      </ChartFrame>
    ),
  },
  {
    name: "Bearish Flag",
    bias: "Bearish",
    developing: "A sharp decline (pole) is followed by an upward-sloping channel. Price remains inside the flag.",
    confirmed: "A close below the lower flag line. Not a live market call.",
    diagram: (
      <ChartFrame>
        <path d="M28 22 L70 82" stroke="#f43f5e" strokeWidth="2.4" fill="none" />
        <path d="M70 82 L118 64 L160 78" stroke="#94a3b8" strokeWidth="1.6" fill="none" />
        <path d="M74 70 L162 54" stroke="#FBB03B" strokeWidth="1" strokeDasharray="4 3" />
        <path d="M78 86 L166 70" stroke="#FBB03B" strokeWidth="1" strokeDasharray="4 3" />
        <path d="M160 78 L188 96" stroke="#f43f5e" strokeWidth="2" />
        <text x="36" y="48" fill="#94a3b8" fontSize="8">Pole</text>
        <text x="108" y="52" fill="#FBB03B" fontSize="8">Flag</text>
        <text x="164" y="108" fill="#f43f5e" fontSize="8">Breakdown</text>
      </ChartFrame>
    ),
  },
  {
    name: "Double Top",
    bias: "Bearish",
    developing: "Two similar highs form an M. The neckline between them has not been broken.",
    confirmed: "A close below the neckline after the second peak.",
    diagram: (
      <ChartFrame>
        <path d="M28 88 L58 30 L96 70 L132 30 L168 88" stroke="#f43f5e" strokeWidth="2" fill="none" />
        <path d="M40 70 H176" stroke="#FBB03B" strokeWidth="1" strokeDasharray="4 3" />
        <path d="M168 88 L196 104" stroke="#f43f5e" strokeWidth="2" />
        <text x="50" y="24" fill="#94a3b8" fontSize="8">Peak 1</text>
        <text x="124" y="24" fill="#94a3b8" fontSize="8">Peak 2</text>
        <text x="86" y="82" fill="#FBB03B" fontSize="8">Neckline</text>
      </ChartFrame>
    ),
  },
  {
    name: "Double Bottom",
    bias: "Bullish",
    developing: "Two similar lows form a W. Price is still below the neckline.",
    confirmed: "A close above the neckline after the second low.",
    diagram: (
      <ChartFrame>
        <path d="M28 28 L58 88 L96 48 L132 88 L168 28" stroke="#34d399" strokeWidth="2" fill="none" />
        <path d="M40 48 H176" stroke="#FBB03B" strokeWidth="1" strokeDasharray="4 3" />
        <path d="M168 28 L196 16" stroke="#34d399" strokeWidth="2" />
        <text x="46" y="104" fill="#94a3b8" fontSize="8">Low 1</text>
        <text x="122" y="104" fill="#94a3b8" fontSize="8">Low 2</text>
        <text x="86" y="42" fill="#FBB03B" fontSize="8">Neckline</text>
      </ChartFrame>
    ),
  },
  {
    name: "Head and Shoulders",
    bias: "Bearish",
    developing: "Left shoulder, higher head, and right shoulder form above a neckline that still holds.",
    confirmed: "A close below the neckline after the right shoulder.",
    diagram: (
      <ChartFrame>
        <path d="M24 78 L52 48 L80 72 L110 22 L140 72 L168 48 L196 88" stroke="#f43f5e" strokeWidth="2" fill="none" />
        <path d="M36 72 H188" stroke="#FBB03B" strokeWidth="1" strokeDasharray="4 3" />
        <text x="42" y="42" fill="#94a3b8" fontSize="7">LS</text>
        <text x="104" y="16" fill="#94a3b8" fontSize="7">Head</text>
        <text x="158" y="42" fill="#94a3b8" fontSize="7">RS</text>
        <text x="88" y="86" fill="#FBB03B" fontSize="8">Neckline</text>
      </ChartFrame>
    ),
  },
  {
    name: "Ascending / Descending Triangle",
    bias: "Either",
    developing: "Swing highs and lows contract into a triangle. The range is still contained by both trendlines.",
    confirmed: "A close beyond the chosen trendline, in the breakout direction. Direction is not assumed here.",
    diagram: (
      <ChartFrame>
        <path d="M32 28 L188 52" stroke="#FBB03B" strokeWidth="1.2" />
        <path d="M32 92 L188 56" stroke="#FBB03B" strokeWidth="1.2" />
        <path d="M40 80 L70 42 L100 70 L130 48 L158 62" stroke="#94a3b8" strokeWidth="1.8" fill="none" />
        <path d="M158 62 L198 62" stroke="#64748b" strokeWidth="1.4" strokeDasharray="3 3" />
        <text x="70" y="24" fill="#FBB03B" fontSize="8">Resistance</text>
        <text x="70" y="108" fill="#FBB03B" fontSize="8">Support</text>
      </ChartFrame>
    ),
  },
];

export default function PatternShowcase() {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">See the Pattern. Understand the Market.</h2>
          <p className="mt-1 text-sm text-slate-400">Educational diagrams only. Not live scanner output and not current prices.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PATTERNS.map((pattern) => (
          <article key={pattern.name} className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{pattern.name}</h3>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                pattern.bias === "Bullish"
                  ? "border-emerald-500/30 text-emerald-300"
                  : pattern.bias === "Bearish"
                    ? "border-rose-500/30 text-rose-300"
                    : "border-[#FBB03B]/30 text-[#FBB03B]"
              }`}
              >
                {pattern.bias}
              </span>
            </div>
            <div className="mt-3">{pattern.diagram}</div>
            <p className="mt-3 text-[11px] font-semibold text-[#FBB03B]">Developing</p>
            <p className="text-[11px] leading-4 text-gray-400">{pattern.developing}</p>
            <p className="mt-2 text-[11px] font-semibold text-emerald-300">Confirmed</p>
            <p className="text-[11px] leading-4 text-gray-400">{pattern.confirmed}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
