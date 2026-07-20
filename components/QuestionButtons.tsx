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
            className={`touch-target flex items-center gap-4 rounded-lg border-2 px-6 text-left text-lg font-medium transition-all sm:text-xl ${
              active
                ? "border-amber bg-amber text-navy-deep shadow-soft"
                : "border-line bg-card text-navy hover:border-amber"
            }`}
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${
                active ? "border-navy-deep" : "border-line"
              }`}
            >
              {active && <span className="h-3.5 w-3.5 rounded-full bg-navy-deep" />}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
