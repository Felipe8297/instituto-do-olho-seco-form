"use client";

import type { Question } from "@/lib/form-config";

interface Props {
  question: Question;
  selected: string[];
  onToggle: (label: string) => void;
}

// Resposta única em botões empilhados (escala de frequência ou Sim/Não).
export default function QuestionButtons({ question, selected, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {question.options.map((opt) => {
        const active = selected.includes(opt.label);
        return (
          <button
            key={opt.label}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(opt.label)}
            className={`touch-target flex items-center gap-4 rounded-2xl border-2 px-6 text-left text-lg font-semibold transition-all sm:text-xl ${
              active
                ? "border-aqua bg-aqua text-white shadow-soft"
                : "border-mist bg-card text-ink hover:border-aqua/50"
            }`}
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${
                active ? "border-white" : "border-mist"
              }`}
            >
              {active && <span className="h-3.5 w-3.5 rounded-full bg-white" />}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
