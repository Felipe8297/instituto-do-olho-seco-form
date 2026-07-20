"use client";

import type { Question } from "@/lib/form-config";

interface Props {
  question: Question;
  selected: string[];
  onToggle: (label: string) => void;
}

// Múltipla escolha em checkboxes grandes.
// A regra "Não desmarca os demais" é aplicada no store (toggleOption).
export default function QuestionDropdown({ question, selected, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="mb-1 text-base font-medium text-mute">Pode marcar mais de uma opção.</p>
      {question.options.map((opt) => {
        const active = selected.includes(opt.label);
        return (
          <button
            key={opt.label}
            type="button"
            role="checkbox"
            aria-checked={active}
            onClick={() => onToggle(opt.label)}
            className={`touch-target flex items-center gap-4 rounded-2xl border-2 px-5 text-left text-lg font-semibold transition-all ${
              active
                ? "border-aqua bg-aqua/10 text-ink"
                : "border-mist bg-card text-ink hover:border-aqua/50"
            }`}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 transition-colors ${
                active ? "border-aqua bg-aqua text-white" : "border-mist bg-white"
              }`}
            >
              {active && (
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                  <path
                    d="M4 10.5l4 4 8-9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
