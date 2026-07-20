import { QUESTIONS, SCORE_BANDS, type ScoreBand } from "./form-config";

/** Soma os pontos de todas as respostas selecionadas (labels). */
export function calcScore(answers: Record<string, string[]>): number {
  return QUESTIONS.reduce((sum, q) => {
    const sel = answers[q.id] ?? [];
    return (
      sum +
      sel.reduce((s, label) => {
        const opt = q.options.find((o) => o.label === label);
        return s + (opt?.points ?? 0);
      }, 0)
    );
  }, 0);
}

/** Faixa correspondente ao score: min <= score < max. */
export function getBand(score: number): ScoreBand {
  return SCORE_BANDS.find((b) => score >= b.min && score < b.max) ?? SCORE_BANDS[0];
}

/** Pontos de uma única pergunta (para o detalhamento no PDF). */
export function questionPoints(questionId: string, selected: string[]): number {
  const q = QUESTIONS.find((qq) => qq.id === questionId);
  if (!q) return 0;
  return selected.reduce((s, label) => {
    const opt = q.options.find((o) => o.label === label);
    return s + (opt?.points ?? 0);
  }, 0);
}
