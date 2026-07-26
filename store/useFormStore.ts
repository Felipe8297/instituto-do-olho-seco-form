import { create } from "zustand";
import { QUESTIONS } from "@/lib/form-config";
import { calcScore } from "@/lib/scoring";

export interface Patient {
  nome: string;
  idade: string;
  telefone: string;
  cpf: string;
  dataNascimento: string; // YYYY-MM-DD (usada para criar o paciente no Sivoe)
}

interface FormState {
  answers: Record<string, string[]>;
  step: number; // índice da pergunta atual (0-based)
  consent: boolean;
  score: number;
  patient: Patient;

  setConsent: (v: boolean) => void;
  setPatient: (partial: Partial<Patient>) => void;
  setAnswer: (questionId: string, labels: string[]) => void;
  toggleOption: (questionId: string, label: string) => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

const OPT_NAO = "Não";
const EMPTY_PATIENT: Patient = { nome: "", idade: "", telefone: "", cpf: "", dataNascimento: "" };

export const useFormStore = create<FormState>((set, get) => ({
  answers: {},
  step: 0,
  consent: false,
  score: 0,
  patient: { ...EMPTY_PATIENT },

  setConsent: (v) => set({ consent: v }),
  setPatient: (partial) => set((s) => ({ patient: { ...s.patient, ...partial } })),

  setAnswer: (questionId, labels) => {
    const answers = { ...get().answers, [questionId]: labels };
    set({ answers, score: calcScore(answers) });
  },

  toggleOption: (questionId, label) => {
    const q = QUESTIONS.find((x) => x.id === questionId);
    if (!q) return;
    const current = get().answers[questionId] ?? [];

    let nextSel: string[];
    if (q.multi) {
      // Múltipla escolha: "Não" é exclusivo (desmarca os demais e vice-versa).
      const has = current.includes(label);
      if (label === OPT_NAO) {
        nextSel = has ? [] : [OPT_NAO];
      } else {
        const base = current.filter((l) => l !== OPT_NAO);
        nextSel = has ? base.filter((l) => l !== label) : [...base, label];
      }
    } else {
      // Resposta única: substitui a seleção.
      nextSel = current.includes(label) ? [] : [label];
    }

    get().setAnswer(questionId, nextSel);
  },

  next: () => set((s) => ({ step: Math.min(s.step + 1, QUESTIONS.length - 1) })),
  prev: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  goTo: (step) => set({ step: Math.max(0, Math.min(step, QUESTIONS.length - 1)) }),

  reset: () => set({ answers: {}, step: 0, consent: false, score: 0, patient: { ...EMPTY_PATIENT } }),
}));
