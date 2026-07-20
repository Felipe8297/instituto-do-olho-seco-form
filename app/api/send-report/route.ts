import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface Body {
  to?: string;
  pdfBase64: string;
  filename: string;
  score: number;
  band: string;
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

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Triagem Olho Seco — Score ${body.score} (${body.band})`,
      html: `<p>Relatório de triagem em anexo.</p>
             <p>Score: <b>${body.score}</b> — faixa <b>${body.band}</b>.</p>
             <p style="color:#4A6467;font-size:12px">Enviado automaticamente pelo formulário de triagem da recepção.</p>`,
      attachments: [{ filename: body.filename, content: body.pdfBase64 }],
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: "Falha no envio (Resend).", detail: text }, { status: 502 });
  }
  return NextResponse.json({ ok: true, detail: text });
}
