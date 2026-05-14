// components/search/CompatibilityBadge.tsx
"use client";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function CompatibilityBadge({ score, size = "md", showLabel = false }: Props) {
  const dimensions = { sm: 48, md: 64, lg: 80 };
  const dim = dimensions[size];
  const strokeWidth = size === "sm" ? 4 : 5;
  const r = (dim - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;

  const color =
    score >= 85 ? "#2D6A4F"
    : score >= 70 ? "#E8821A"
    : "#B76E79";

  const fontSize = { sm: 11, md: 14, lg: 18 }[size];

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <svg width={dim} height={dim} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth}
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center flex-col"
        style={{ fontSize, fontWeight: 700, color, lineHeight: 1 }}
      >
        {score}%
      </div>
      {showLabel && (
        <span className="text-xs font-semibold" style={{ color }}>
          {score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Low"}
        </span>
      )}
    </div>
  );
}
