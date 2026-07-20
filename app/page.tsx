"use client";

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
    router.push("/form");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-10 text-center">
      {/* Assinatura: gota / olho estilizado */}
      <div className="animate-fadeUp">
        <TearMark />
      </div>

      <p className="mt-8 animate-fadeUp font-display text-sm font-semibold uppercase tracking-[0.25em] text-aqua-deep">
        Instituto do Olho Seco
      </p>

      <h1 className="mt-4 animate-fadeUp font-display text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">
        Como andam
        <br />
        seus olhos hoje?
      </h1>

      <p className="mt-5 max-w-xl animate-fadeUp text-lg leading-relaxed text-mute sm:text-xl">
        São {QUESTIONS.length} perguntas rápidas para uma triagem de olho seco. Leva menos de 5
        minutos e ajuda o seu médico a cuidar melhor de você.
      </p>

      {/* Consentimento LGPD (dado de saúde) */}
      <label className="mt-8 flex max-w-xl cursor-pointer items-start gap-3 rounded-2xl border-2 border-mist bg-card/70 p-4 text-left">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1 h-6 w-6 shrink-0 accent-aqua"
        />
        <span className="text-base leading-snug text-ink">
          Autorizo o uso das minhas respostas para esta triagem e o envio do resumo por e-mail à
          equipe do Instituto, conforme a LGPD.
        </span>
      </label>

      <button
        type="button"
        onClick={iniciar}
        disabled={!agree}
        className="mt-8 w-full max-w-md touch-target rounded-2xl bg-aqua px-8 text-2xl font-bold text-white shadow-soft transition-all enabled:hover:bg-aqua-deep enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-mist disabled:text-mute"
        style={{ minHeight: 76 }}
      >
        Iniciar triagem
      </button>

      <p className="mt-6 max-w-md text-sm text-mute">
        Esta triagem não substitui uma avaliação médica.
      </p>
    </main>
  );
}

function TearMark() {
  return (
    <svg width="96" height="120" viewBox="0 0 96 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tearGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3FC3CE" />
          <stop offset="100%" stopColor="#0B7A85" />
        </linearGradient>
      </defs>
      {/* Íris/olho */}
      <ellipse cx="48" cy="46" rx="44" ry="30" stroke="#0B7A85" strokeWidth="3" />
      <circle cx="48" cy="46" r="15" fill="url(#tearGrad)" />
      <circle cx="43" cy="41" r="4.5" fill="#EDF3F2" />
      {/* Gota */}
      <path
        d="M48 78c0 0 -13 18 -13 28a13 13 0 0 0 26 0c0 -10 -13 -28 -13 -28z"
        fill="url(#tearGrad)"
      />
    </svg>
  );
}
