import React from "react";

export const CompatibilityRing = ({ pct, size = 56 }: { pct: number, size?: number }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  const color = pct >= 85 ? "#2D6A4F" : pct >= 70 ? "#E8821A" : "#B76E79";
  
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0E8D8" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <span style={{ fontSize: size < 60 ? 11 : 14, fontWeight: 700, color, lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
};

export const Avatar = ({ src, name, size = 48, online = false }: { src?: string, name: string, size?: number, online?: boolean }) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: "2px solid #F0E8D8" }}>
      {src ? (
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#E8821A,#D4AF37)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: size * 0.35, fontFamily: "'Cormorant Garamond', serif" }}>
          {name?.[0]}
        </div>
      )}
    </div>
    {online && (
      <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, background: "#40916C", border: "2px solid white", borderRadius: "50%" }} />
    )}
  </div>
);
