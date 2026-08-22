"use client";

import type { WheelSegment } from "@/lib/rewards";

type PrizeWheelProps = {
  segments: WheelSegment[];
  rotation: number;
  spinning: boolean;
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(index: number, count: number, radius: number) {
  const slice = 360 / count;
  const start = index * slice;
  const end = start + slice;
  const p1 = polar(100, 100, radius, start);
  const p2 = polar(100, 100, radius, end);
  const large = slice > 180 ? 1 : 0;
  return `M 100 100 L ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
}

export default function PrizeWheel({
  segments,
  rotation,
  spinning,
}: PrizeWheelProps) {
  const count = segments.length;

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <div
        className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1"
        aria-hidden
      >
        <div className="h-0 w-0 border-x-[14px] border-t-[28px] border-x-transparent border-t-[#FBB03B] drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]" />
      </div>

      <div className="rounded-full bg-gradient-to-b from-[#FBB03B] to-[#b45309] p-[8px] shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div
          className="aspect-square w-full overflow-hidden rounded-full bg-[#020817]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? "transform 4.6s cubic-bezier(0.12, 0.7, 0.08, 1)"
              : "none",
          }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            {segments.map((segment, index) => {
              const mid = (index + 0.5) * (360 / count);
              const labelPos = polar(100, 100, 62, mid);
              return (
                <g key={`${segment.key}-${index}`}>
                  <path
                    d={slicePath(index, count, 100)}
                    fill={segment.color}
                    stroke="#020817"
                    strokeWidth="1.2"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={segment.textColor}
                    fontSize="7.2"
                    fontWeight="800"
                    transform={`rotate(${mid} ${labelPos.x} ${labelPos.y})`}
                  >
                    {segment.shortLabel}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="22" fill="#111827" stroke="#FBB03B" strokeWidth="3" />
            <text
              x="100"
              y="100"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FBB03B"
              fontSize="8"
              fontWeight="800"
            >
              SPIN
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
