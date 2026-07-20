"use client";

import { useEffect, useRef, useState } from "react";
import { SCORE_MAX_ESCALA, type ScoreBand } from "@/lib/form-config";

interface Props {
  score: number;
  band: ScoreBand;
  max?: number;
}

// Geometria do arco (viewBox 360x250).
const CX = 180;
const CY = 190;
const R = 150;
const STROKE = 28;

// Ponto sobre o arco para a fração t (0 = esquerda, 1 = direita, passando pelo topo).
function pointAt(t: number) {
  const a = (Math.PI * (1 - t)); // 180°..0°
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) };
}

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Thermometer({ score, band, max = SCORE_MAX_ESCALA }: Props) {
  const target = Math.max(0, Math.min(score / max, 1));
  const [t, setT] = useState(prefersReducedMotion ? target : 0);
  const raf = useRef<number>();

  // Tween do ponteiro 0 → alvo.
  useEffect(() => {
    if (prefersReducedMotion) {
      setT(target);
      return;
    }
    const start = performance.now();
    const dur = 950;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setT(target * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target]);

  const left = pointAt(0);
  const right = pointAt(1);
  const knob = pointAt(t);
  const trackPath = `M ${left.x} ${left.y} A ${R} ${R} 0 0 1 ${right.x} ${right.y}`;

  return (
    <svg
      viewBox="0 0 360 250"
      width="100%"
      height="100%"
      role="img"
      aria-label={`Resultado: score ${score} de ${max}, faixa ${band.label}`}
    >
      <defs>
        <linearGradient id="arcGrad" x1={left.x} y1="0" x2={right.x} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="42%" stopColor="#eab308" />
          <stop offset="68%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <filter id="knobShadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0C2A2E" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Trilho cinza de fundo */}
      <path
        d={trackPath}
        fill="none"
        stroke="#E7EEED"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {/* Arco colorido */}
      <path
        d={trackPath}
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />

      {/* Ponteiro (knob) */}
      <circle cx={knob.x} cy={knob.y} r={17} fill="#FFFFFF" filter="url(#knobShadow)" />
      <circle cx={knob.x} cy={knob.y} r={9} fill={band.color} />

      {/* Texto central */}
      <text
        x={CX}
        y={112}
        textAnchor="middle"
        fontSize={17}
        letterSpacing="2"
        fill="#4A6467"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
        SEU RESULTADO
      </text>
      <text
        x={CX}
        y={182}
        textAnchor="middle"
        fontSize={72}
        fill="#0C2A2E"
        style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
      >
        {score}
      </text>
      <text
        x={CX}
        y={210}
        textAnchor="middle"
        fontSize={18}
        letterSpacing="1"
        fill="#4A6467"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
        de {max}
      </text>
      <text
        x={CX}
        y={240}
        textAnchor="middle"
        fontSize={24}
        fill={band.color}
        style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
      >
        {band.label}
      </text>
    </svg>
  );
}
