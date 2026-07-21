"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/store/useFormStore";
import { QUESTIONS } from "@/lib/form-config";

export default function Home() {
  const router = useRouter();
  const reset = useFormStore((s) => s.reset);
  const setConsent = useFormStore((s) => s.setConsent);
  const [agree, setAgree] = useState(false);

  // Toda vez que voltamos à Home, começamos do zero (kiosk).
  useEffect(() => {
    reset();
  }, [reset]);

  function iniciar() {
    if (!agree) return;
    setConsent(true);
    router.push("/dados");
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-navy px-6 py-12 text-center">
      {/* brilho dourado sutil ao fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 0%, rgba(201,166,107,0.16) 0%, rgba(25,41,56,0) 70%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <img
          src="/logo.png"
          alt="Instituto do Olho Seco"
          className="h-16 w-auto animate-fadeUp sm:h-20"
        />

        <p className="mt-10 animate-fadeUp text-xs font-semibold uppercase tracking-[0.3em] text-amber">
          Triagem de olho seco
        </p>

        <h1 className="mt-4 animate-fadeUp font-display text-4xl font-light leading-[1.1] text-white sm:text-5xl">
          Como andam
          <br />
          seus olhos hoje?
        </h1>

        <p className="mt-5 max-w-lg animate-fadeUp text-lg font-light leading-relaxed text-white/70 sm:text-xl">
          São {QUESTIONS.length} perguntas rápidas. Leva menos de 5 minutos e ajuda o seu médico a
          cuidar melhor de você.
        </p>

        {/* Consentimento LGPD (dado de saúde) */}
        <label className="mt-9 flex max-w-lg cursor-pointer items-start gap-3 rounded-lg border border-white/15 bg-white/5 p-4 text-left">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-amber"
          />
          <span className="text-base font-light leading-snug text-white/85">
            Autorizo o uso das minhas respostas para esta triagem e o envio do resumo por e-mail à
            equipe do Instituto, conforme a LGPD.
          </span>
        </label>

        <button
          type="button"
          onClick={iniciar}
          disabled={!agree}
          className="mt-8 w-full max-w-md touch-target rounded-lg bg-amber px-8 text-xl font-semibold text-navy-deep shadow-lg transition-all enabled:hover:bg-amber-light enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
          style={{ minHeight: 72 }}
        >
          Iniciar triagem
        </button>

        <p className="mt-6 max-w-md text-sm font-light text-white/45">
          Esta triagem não substitui uma avaliação médica.
        </p>
      </div>
    </main>
  );
}
