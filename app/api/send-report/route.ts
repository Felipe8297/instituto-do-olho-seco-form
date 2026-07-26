import { NextResponse } from "next/server";
import {
  createPaciente,
  createProntuario,
  findPacienteByCpf,
  onlyDigits,
} from "@/lib/sivoe";
import { esc, sendReportEmail } from "@/lib/report-email";
import { appendRow } from "@/lib/google-sheets";
import { QUESTIONS } from "@/lib/form-config";

export const runtime = "nodejs";

interface Body {
  pdfBase64: string;
  filename: string;
  score: number;
  band: string;
  answers?: Record<string, string[]>;
  patient?: {
    nome?: string;
    idade?: string;
    telefone?: string;
    cpf?: string;
    dataNascimento?: string; // YYYY-MM-DD
  };
}

// Cabeçalho fixo + uma coluna por pergunta (rótulo = texto da pergunta).
const SHEET_HEADER = [
  "Data/Hora",
  "Nome",
  "CPF",
  "Idade",
  "Telefone",
  "Nascimento",
  "Score",
  "Faixa",
  ...QUESTIONS.map((q, i) => `${i + 1}. ${q.text}`),
];

/** Grava a triagem numa nova linha da planilha do Google (best-effort). */
async function registrarNaPlanilha(b: Body) {
  const p = b.patient ?? {};
  const answers = b.answers ?? {};
  const row: (string | number)[] = [
    new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    p.nome ?? "",
    p.cpf ?? "",
    p.idade ?? "",
    p.telefone ?? "",
    p.dataNascimento ?? "",
    b.score,
    b.band,
    ...QUESTIONS.map((q) => (answers[q.id] ?? []).join(", ")),
  ];
  await appendRow(row, SHEET_HEADER);
}

/** Resumo HTML da triagem gravado como mensagem do prontuário. */
function mensagemProntuario(b: Body): string {
  const p = b.patient ?? {};
  return `<p><b>Triagem — Olho Seco (recepção)</b></p>
          <table style="border-collapse:collapse;font-size:14px;margin:8px 0">
            <tr><td style="padding:2px 12px 2px 0;color:#5a6478">Paciente</td><td><b>${esc(p.nome) || "—"}</b></td></tr>
            <tr><td style="padding:2px 12px 2px 0;color:#5a6478">Idade</td><td>${esc(p.idade) || "—"}</td></tr>
            <tr><td style="padding:2px 12px 2px 0;color:#5a6478">Telefone</td><td>${esc(p.telefone) || "—"}</td></tr>
            <tr><td style="padding:2px 12px 2px 0;color:#5a6478">Score</td><td><b>${b.score}</b> — faixa <b>${esc(b.band)}</b></td></tr>
          </table>
          <p style="color:#5a6478;font-size:12px">Relatório completo em anexo (PDF). Registrado automaticamente pelo formulário de triagem.</p>`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  if (!body.pdfBase64 || !body.filename) {
    return NextResponse.json({ error: "PDF ausente." }, { status: 400 });
  }

  const p = body.patient ?? {};
  const cpf = onlyDigits(p.cpf);

  // --- Consolidação na planilha do Google (best-effort, não bloqueia) --------
  await registrarNaPlanilha(body).catch((err) =>
    console.error("[send-report] Falha ao gravar na planilha do Google:", err)
  );

  // --- Fluxo principal: gravar no prontuário do paciente no Sivoe ------------
  try {
    if (cpf.length !== 11) {
      throw new Error("CPF ausente ou inválido — impossível localizar/criar paciente.");
    }
    if (!p.dataNascimento) {
      throw new Error("Data de nascimento ausente — necessária para criar paciente.");
    }

    let pacienteId = await findPacienteByCpf(cpf);
    if (!pacienteId) {
      pacienteId = await createPaciente({
        nome: (p.nome ?? "").trim(),
        cpf,
        dataNascimento: p.dataNascimento,
        celular: p.telefone,
      });
    }

    const { prontuario_id } = await createProntuario(pacienteId, {
      mensagem: mensagemProntuario(body),
      anexos: [
        { nome: body.filename, base64: body.pdfBase64, mime_type: "application/pdf" },
      ],
    });

    return NextResponse.json({ ok: true, via: "sivoe", pacienteId, prontuarioId: prontuario_id });
  } catch (sivoeErr) {
    console.error("[send-report] Falha no Sivoe, tentando fallback por e-mail:", sivoeErr);

    // --- Fallback: enviar o relatório por e-mail (comportamento antigo) ------
    try {
      await sendReportEmail({
        patient: p,
        score: body.score,
        band: body.band,
        pdfBase64: body.pdfBase64,
        filename: body.filename,
      });
      return NextResponse.json({ ok: true, via: "email-fallback", motivo: String(sivoeErr) });
    } catch (emailErr) {
      console.error("[send-report] Fallback por e-mail também falhou:", emailErr);
      return NextResponse.json(
        {
          error: "Falha ao registrar no prontuário e no e-mail.",
          sivoe: String(sivoeErr),
          email: String(emailErr),
        },
        { status: 502 }
      );
    }
  }
}
