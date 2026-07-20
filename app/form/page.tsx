"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/form-config";
import { useFormStore } from "@/store/useFormStore";
import ProgressBar from "@/components/ProgressBar";
import QuestionButtons from "@/components/QuestionButtons";
import QuestionBoxes from "@/components/QuestionBoxes";
import QuestionDropdown from "@/components/QuestionDropdown";

export default function FormPage() {
  const router = useRouter();
  const { step, answers, consent, toggleOption, next, prev } = useFormStore();

  // Sem consentimento, volta pra Home (acesso direto por URL).
  useEffect(() => {
    if (!consent) router.replace("/");
  }, [consent, router]);

  const q = QUESTIONS[step];
  const selected = answers[q.id] ?? [];
  const answered = selected.length > 0;
  const isLast = step === QUESTIONS.length - 1;

  function avancar() {
    if (!answered) return;
    if (isLast) router.push("/result");
    else next();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Topo fixo: progresso */}
      <header className="sticky top-0 z-10 border-b border-mist bg-bg/85 px-6 py-4 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <ProgressBar current={step + 1} total={QUESTIONS.length} />
        </div>
      </header>

      {/* Corpo rolável */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div key={q.id} className="mx-auto max-w-2xl animate-fadeUp">
          {q.section && (
            <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-aqua-deep">
              {q.section}
            </p>
          )}
          <h2 className="mb-7 font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {q.text}
          </h2>

          {q.view === "botoes" && (
            <QuestionButtons question={q} selected={selected} onToggle={(l) => toggleOption(q.id, l)} />
          )}
          {q.view === "caixinhas" && (
            <QuestionBoxes question={q} selected={selected} onToggle={(l) => toggleOption(q.id, l)} />
          )}
          {q.view === "dropdown" && (
            <QuestionDropdown question={q} selected={selected} onToggle={(l) => toggleOption(q.id, l)} />
          )}
        </div>
      </main>

      {/* Rodapé fixo: navegação (thumb-zone) */}
      <footer className="sticky bottom-0 border-t border-mist bg-bg/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="touch-target flex-1 rounded-2xl border-2 border-mist bg-card px-6 text-lg font-semibold text-ink transition-colors enabled:hover:border-aqua/50 disabled:opacity-40"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={avancar}
            disabled={!answered}
            className="touch-target flex-[2] rounded-2xl bg-aqua px-6 text-xl font-bold text-white shadow-soft transition-all enabled:hover:bg-aqua-deep enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-mist disabled:text-mute"
          >
            {isLast ? "Ver resultado" : "Avançar"}
          </button>
        </div>
      </footer>
    </div>
  );
}
