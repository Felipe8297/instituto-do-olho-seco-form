"use client";

import { useEffect, useState } from "react";
import { BAND_TICKS, SCORE_MAX_ESCALA, type ScoreBand } from "@/lib/form-config";

interface Props {
  score: number;
  band: ScoreBand;
  max?: number;
}

// Geometria do tubo (coordenadas SVG).
const TOP = 34;
const BOTTOM = 300;
const CX = 70;
const TUBE_W = 40;
const BULB_R = 34;
const BULB_CY = BOTTOM + 40;

export default function Thermometer({ score, band, max = SCORE_MAX_ESCALA }: Props) {
  const target = Math.max(0, Math.min(score / max, 1));
  const [frac, setFrac] = useState(0);

  // Anima o preenchimento de 0 → alvo ao montar.
  useEffect(() => {
    const t = requestAnimationFrame(() => setFrac(target));
    return () => cancelAnimationFrame(t);
  }, [target]);

  const range = BOTTOM - TOP;
  const fillH = frac * range;
  const fillY = BOTTOM - fillH;

  const tickY = (v: number) => BOTTOM - (v / max) * range;

  return (
    <svg
      viewBox="0 0 200 400"
      width="100%"
      height="100%"
      role="img"
      aria-label={`Termômetro do resultado: score ${score}, faixa ${band.label}`}
    >
      <defs>
        <linearGradient id="liquid" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={band.color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={band.color} stopOpacity="1" />
        </linearGradient>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Trilho (vidro) */}
      <rect
        x={CX - TUBE_W / 2}
        y={TOP}
        width={TUBE_W}
        height={BOTTOM - TOP + 6}
        rx={TUBE_W / 2}
        fill="#E2EDEC"
      />
      <circle cx={CX} cy={BULB_CY} r={BULB_R} fill="#E2EDEC" />

      {/* Bulbo preenchido (sempre cheio) */}
      <circle cx={CX} cy={BULB_CY} r={BULB_R - 6} fill="url(#liquid)" filter="url(#glow)" />

      {/* Coluna de líquido */}
      <clipPath id="tubeClip">
        <rect
          x={CX - TUBE_W / 2 + 6}
          y={TOP}
          width={TUBE_W - 12}
          height={BOTTOM - TOP}
          rx={(TUBE_W - 12) / 2}
        />
      </clipPath>
      <rect
        clipPath="url(#tubeClip)"
        x={CX - TUBE_W / 2 + 6}
        y={fillY}
        width={TUBE_W - 12}
        height={fillH + 40}
        fill="url(#liquid)"
        style={{ transition: "y 1.1s cubic-bezier(0.22,1,0.36,1), height 1.1s cubic-bezier(0.22,1,0.36,1)" }}
      />

      {/* Marcadores das faixas (20 / 30 / 40) */}
      {BAND_TICKS.map((v) => {
        const y = tickY(v);
        return (
          <g key={v}>
            <line
              x1={CX + TUBE_W / 2 + 4}
              y1={y}
              x2={CX + TUBE_W / 2 + 20}
              y2={y}
              stroke="#4A6467"
              strokeWidth={2}
            />
            <text x={CX + TUBE_W / 2 + 26} y={y + 5} fontSize={16} fill="#4A6467" fontWeight={600}>
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
