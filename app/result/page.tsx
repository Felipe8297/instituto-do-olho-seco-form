"use client";

import BrandBar from "@/components/BrandBar";
import Thermometer from "@/components/Thermometer";
import { KIOSK_RESET_SECONDS } from "@/lib/form-config";
import { getBand } from "@/lib/scoring";
import { useFormStore } from "@/store/useFormStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SendState = "idle" | "sending" | "sent" | "fallback" | "error";

// "José da Silva" -> "jose-da-silva" (para o nome do arquivo)
function slugNome(nome: string): string {
  const s = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "paciente";
}

export default function ResultPage() {
  const router = useRouter();
  const { answers, score, consent, patient } = useFormStore();
  const band = getBand(score);
  const [send, setSend] = useState<SendState>("idle");
  const sentOnce = useRef(false);

  // Acesso direto sem passar pelo formulário → volta pra Home.
  useEffect(() => {
    if (!consent) router.replace("/");
  }, [consent, router]);

  // Envio automático do resumo por e-mail ao abrir a tela (uma única vez).
  useEffect(() => {
    if (!consent || sentOnce.current) return;
    sentOnce.current = true;

    (async () => {
      setSend("sending");
      try {
        const { generatePdfBase64 } = await import("@/lib/generate-pdf");
        const now = new Date();
        const dateStr = now.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
        const pdfBase64 = await generatePdfBase64({ answers, score, band, dateStr, patient });

        const res = await fetch("/api/send-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfBase64,
            filename: `triagem-olho-seco-${slugNome(patient.nome)}.pdf`,
            score,
            band: band.label,
            answers, // respostas por pergunta, para consolidar na planilha
            patient, // inclui nome, cpf, idade, telefone e dataNascimento
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json().catch(() => ({}));
        // via = "sivoe" quando gravou no prontuário; "email-fallback" quando caiu no e-mail.
        setSend(data.via === "email-fallback" ? "fallback" : "sent");
      } catch (e) {
        console.error(e);
        setSend("error");
      }
    })();
  }, [consent, answers, score, band, patient]);

  // Timer oculto de reset (kiosk): volta para a Home após 30s.
  useEffect(() => {
    const t = setTimeout(() => router.push("/"), KIOSK_RESET_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col bg-off-white">
      <BrandBar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-10">
        {/* Gauge de score (assinatura) */}
        <div className="w-full max-w-[460px] animate-fadeUp">
          <Thermometer score={score} band={band} />
        </div>

        {/* Mensagem da faixa */}
        <p className="mt-2 max-w-xl animate-fadeUp text-center text-lg font-light leading-relaxed text-ink sm:text-xl">
          {band.msg}
        </p>
        
        {/* Status discreto do envio */}
        <div className="mt-6 h-5 text-center text-sm font-medium">
          {send === "sending" && <span className="text-mute">Registrando no prontuário…</span>}
          {send === "sent" && <span className="text-[#2d7a4f]">✓ Registrado no prontuário</span>}
          {send === "fallback" && (
            <span className="text-mute">✓ Enviado à recepção (o registro no prontuário será concluído manualmente).</span>
          )}
          {send === "error" && (
            <span className="text-mute">Não foi possível registrar automaticamente. A recepção fará o registro.</span>
          )}
        </div>
      </main>
    </div>
  );
}
