"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/store/useFormStore";
import { getBand } from "@/lib/scoring";
import { KIOSK_RESET_SECONDS } from "@/lib/form-config";
import Thermometer from "@/components/Thermometer";

type SendState = "idle" | "sending" | "sent" | "error";

export default function ResultPage() {
  const router = useRouter();
  const { answers, score, consent } = useFormStore();
  const band = getBand(score);
  const [send, setSend] = useState<SendState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Acesso direto sem passar pelo formulário → volta pra Home.
  useEffect(() => {
    if (!consent) router.replace("/");
  }, [consent, router]);

  const goHome = useCallback(() => router.push("/"), [router]);

  // Timer oculto de reset (kiosk): qualquer toque reinicia a contagem.
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(goHome, KIOSK_RESET_SECONDS * 1000);
  }, [goHome]);

  useEffect(() => {
    resetTimer();
    const bump = () => resetTimer();
    window.addEventListener("pointerdown", bump);
    window.addEventListener("keydown", bump);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("keydown", bump);
    };
  }, [resetTimer]);

  async function enviarEmail() {
    setSend("sending");
    try {
      // Import dinâmico: mantém o @react-pdf/renderer fora do SSR.
      const { generatePdfBase64 } = await import("@/lib/generate-pdf");
      const now = new Date();
      const dateStr = now.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
      const pdfBase64 = await generatePdfBase64({ answers, score, band, dateStr });

      const stamp = now
        .toISOString()
        .slice(0, 16)
        .replace(/[-:T]/g, "");
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_REPORT_EMAIL || undefined,
          pdfBase64,
          filename: `triagem-olho-seco-${stamp}.pdf`,
          score,
          band: band.label,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSend("sent");
    } catch (e) {
      console.error(e);
      setSend("error");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-10">
      <div className="grid w-full animate-fadeUp grid-cols-1 items-center gap-6 sm:grid-cols-[200px_1fr]">
        {/* Termômetro (assinatura) */}
        <div className="mx-auto h-[340px] w-[180px]">
          <Thermometer score={score} band={band} />
        </div>

        {/* Resultado */}
        <div className="text-center sm:text-left">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-mute">
            Seu resultado
          </p>
          <div className="mt-1 flex items-baseline justify-center gap-3 sm:justify-start">
            <span className="font-display text-7xl font-extrabold leading-none text-ink">
              {score}
            </span>
            <span
              className="rounded-full px-4 py-1.5 font-display text-xl font-bold text-white"
              style={{ backgroundColor: band.color }}
            >
              {band.label}
            </span>
          </div>
          <p className="mt-5 text-lg leading-relaxed text-ink sm:text-xl">{band.msg}</p>
        </div>
      </div>

      {/* Ações */}
      <div className="mt-10 flex w-full max-w-md flex-col gap-3">
        {send !== "sent" ? (
          <button
            type="button"
            onClick={enviarEmail}
            disabled={send === "sending"}
            className="touch-target rounded-2xl bg-aqua px-8 text-xl font-bold text-white shadow-soft transition-all enabled:hover:bg-aqua-deep enabled:active:scale-[0.99] disabled:opacity-70"
          >
            {send === "sending" ? "Enviando..." : "Enviar resumo por e-mail"}
          </button>
        ) : (
          <div className="touch-target flex items-center justify-center gap-2 rounded-2xl bg-green-100 px-8 text-lg font-bold text-green-800">
            ✓ Resumo enviado com sucesso
          </div>
        )}

        {send === "error" && (
          <p className="text-center text-sm font-medium text-red-600">
            Não foi possível enviar agora. Você pode concluir mesmo assim — avise a recepção.
          </p>
        )}

        <button
          type="button"
          onClick={goHome}
          className="touch-target rounded-2xl border-2 border-mist bg-card px-8 text-lg font-semibold text-ink transition-colors hover:border-aqua/50"
        >
          Concluir
        </button>
      </div>

      <p className="mt-8 max-w-md text-center text-sm text-mute">
        Esta triagem não substitui uma avaliação médica. Leve o resultado ao seu oftalmologista.
      </p>
    </main>
  );
}
