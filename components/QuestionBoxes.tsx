"use client";

import type { Question } from "@/lib/form-config";

interface Props {
  question: Question;
  selected: string[];
  onToggle: (label: string) => void;
}

// Resposta única em cartões lado a lado (escala 0–4 / 0–5).
export default function QuestionBoxes({ question, selected, onToggle }: Props) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))` }}>
      {question.options.map((opt, i) => {
        const active = selected.includes(opt.label);
        return (
          <button
            key={opt.label}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(opt.label)}
            className={`flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 text-center transition-all ${
              active
                ? "border-amber bg-amber text-graphite-deep shadow-soft"
                : "border-line bg-card text-graphite hover:border-amber"
            }`}
          >
            <span
              className={`font-display text-2xl font-semibold ${active ? "text-graphite-deep" : "text-amber"}`}
            >
              {i}
            </span>
            <span className="text-sm font-medium leading-tight sm:text-base">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
