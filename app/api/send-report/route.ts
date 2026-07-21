import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface Body {
  to?: string;
  pdfBase64: string;
  filename: string;
  score: number;
  band: string;
  patient?: { nome?: string; idade?: string; telefone?: string };
}

// Escapa texto do paciente antes de injetar no HTML do e-mail.
function esc(v?: string) {
  return (v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const defaultTo = process.env.REPORT_EMAIL ?? "felipe8297@gmail.com";

  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const to = body.to || defaultTo;
  if (!body.pdfBase64 || !body.filename) {
    return NextResponse.json({ error: "PDF ausente." }, { status: 400 });
  }

  const p = body.patient ?? {};
  const nome = esc(p.nome).trim();
  const subject = nome
    ? `Triagem Olho Seco — ${nome} — Score ${body.score} (${body.band})`
    : `Triagem Olho Seco — Score ${body.score} (${body.band})`;

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
               <tr><td style="padding:2px 12px 2px 0;color:#5a6478">Score</td><td><b>${body.score}</b> — faixa <b>${body.band}</b></td></tr>
             </table>
             <p style="color:#5a6478;font-size:12px">Enviado automaticamente pelo formulário de triagem da recepção.</p>`,
      attachments: [{ filename: body.filename, content: body.pdfBase64 }],
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: "Falha no envio (Resend).", detail: text }, { status: 502 });
  }
  return NextResponse.json({ ok: true, detail: text });
}
