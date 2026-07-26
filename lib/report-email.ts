/**
 * Envio do relatório de triagem por e-mail via Resend (server-only).
 * Usado como FALLBACK quando a gravação no prontuário do Sivoe falha.
 */

export interface ReportEmailInput {
  patient?: { nome?: string; idade?: string; telefone?: string };
  score: number;
  band: string;
  pdfBase64: string;
  filename: string;
  to?: string;
}

/** Escapa texto do paciente antes de injetar no HTML do e-mail. */
export function esc(v?: string) {
  return (v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendReportEmail(input: ReportEmailInput): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const to = input.to || process.env.REPORT_EMAIL || "institutodoolhoseco@gmail.com";

  if (!apiKey) throw new Error("RESEND_API_KEY não configurada no servidor.");
  if (!input.pdfBase64 || !input.filename) throw new Error("PDF ausente.");

  const p = input.patient ?? {};
  const nome = esc(p.nome).trim();
  const subject = nome
    ? `Triagem Olho Seco — ${nome} — Score ${input.score} (${input.band})`
    : `Triagem Olho Seco — Score ${input.score} (${input.band})`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html: `<p>Relatório de triagem em anexo.</p>
             <table style="border-collapse:collapse;font-size:14px;margin:8px 0">
               <tr><td style="padding:2px 12px 2px 0;color:#5a6478">Paciente</td><td><b>${nome || "—"}</b></td></tr>
               <tr><td style="padding:2px 12px 2px 0;color:#5a6478">Idade</td><td>${esc(p.idade) || "—"}</td></tr>
               <tr><td style="padding:2px 12px 2px 0;color:#5a6478">Telefone</td><td>${esc(p.telefone) || "—"}</td></tr>
               <tr><td style="padding:2px 12px 2px 0;color:#5a6478">Score</td><td><b>${input.score}</b> — faixa <b>${input.band}</b></td></tr>
             </table>
             <p style="color:#5a6478;font-size:12px">Enviado automaticamente pelo formulário de triagem da recepção.</p>`,
      attachments: [{ filename: input.filename, content: input.pdfBase64 }],
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Falha no envio (Resend) ${res.status}: ${text}`);
  return text;
}
