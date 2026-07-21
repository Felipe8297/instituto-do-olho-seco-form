"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/store/useFormStore";
import BrandBar from "@/components/BrandBar";

export default function DadosPage() {
  const router = useRouter();
  const { consent, patient, setPatient } = useFormStore();

  // Sem consentimento, volta pra Home (acesso direto por URL).
  useEffect(() => {
    if (!consent) router.replace("/");
  }, [consent, router]);

  const nome = patient.nome.trim();
  const idade = patient.idade.trim();
  const telefone = patient.telefone.trim();
  const valido = nome.length >= 2 && idade.length >= 1 && telefone.length >= 8;

  function continuar() {
    if (!valido) return;
    router.push("/form");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-off-white">
      <BrandBar />

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-xl animate-fadeUp">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Antes de começar
          </p>
          <h2 className="mb-2 font-sans text-2xl font-semibold leading-snug text-navy sm:text-3xl">
            Seus dados
          </h2>
          <p className="mb-7 text-base font-light text-mute">
            Para o Instituto identificar sua triagem.
          </p>

          <div className="flex flex-col gap-5">
            <Field label="Nome completo">
              <input
                type="text"
                value={patient.nome}
                onChange={(e) => setPatient({ nome: e.target.value })}
                autoComplete="off"
                autoCapitalize="words"
                placeholder="Digite seu nome"
                className="input-triagem"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Idade">
                <input
                  type="number"
                  inputMode="numeric"
                  value={patient.idade}
                  onChange={(e) => setPatient({ idade: e.target.value })}
                  autoComplete="off"
                  placeholder="Ex: 62"
                  min={0}
                  max={120}
                  className="input-triagem"
                />
              </Field>

              <Field label="Telefone">
                <input
                  type="tel"
                  inputMode="tel"
                  value={patient.telefone}
                  onChange={(e) => setPatient({ telefone: e.target.value })}
                  autoComplete="off"
                  placeholder="(11) 90000-0000"
                  className="input-triagem"
                />
              </Field>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-line bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="touch-target flex-1 rounded-lg border-2 border-navy bg-transparent px-6 text-lg font-semibold text-navy transition-colors hover:bg-navy/5"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={continuar}
            disabled={!valido}
            className="touch-target flex-[2] rounded-lg bg-amber px-6 text-xl font-semibold text-navy-deep shadow-soft transition-all enabled:hover:bg-amber-light enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-line disabled:text-mute disabled:shadow-none"
          >
            Continuar
          </button>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}
