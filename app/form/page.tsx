"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/form-config";
import { useFormStore } from "@/store/useFormStore";
import BrandBar from "@/components/BrandBar";
import ProgressBar from "@/components/ProgressBar";
import QuestionButtons from "@/components/QuestionButtons";
import QuestionBoxes from "@/components/QuestionBoxes";
import QuestionDropdown from "@/components/QuestionDropdown";

export default function FormPage() {
  const router = useRouter();
  const { step, answers, consent, patient, toggleOption, next, prev } = useFormStore();

  // Guarda o fluxo: sem consentimento ou sem dados do paciente → Home.
  useEffect(() => {
    if (!consent || !patient.nome.trim()) router.replace("/");
  }, [consent, patient.nome, router]);

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
    <div className="flex min-h-dvh flex-col bg-off-white">
      {/* Topo: marca + progresso */}
      <BrandBar>
        <ProgressBar current={step + 1} total={QUESTIONS.length} />
      </BrandBar>

      {/* Corpo rolável */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div key={q.id} className="mx-auto max-w-2xl animate-fadeUp">
          {q.section && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber">
              {q.section}
            </p>
          )}
          <h2 className="mb-7 font-sans text-2xl font-semibold leading-snug text-graphite sm:text-3xl">
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
      <footer className="sticky bottom-0 border-t border-line bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="touch-target flex-1 rounded-lg border-2 border-graphite bg-transparent px-6 text-lg font-semibold text-graphite transition-colors enabled:hover:bg-graphite/5 disabled:opacity-30"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={avancar}
            disabled={!answered}
            className="touch-target flex-[2] rounded-lg bg-amber px-6 text-xl font-semibold text-graphite-deep shadow-soft transition-all enabled:hover:bg-amber-light enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-line disabled:text-mute disabled:shadow-none"
          >
            {isLast ? "Ver resultado" : "Avançar"}
          </button>
        </div>
      </footer>
    </div>
  );
}
